import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, action, token } = body

  const supabase = await createAdminClient()

  if (action === 'send') {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'https://www.mystandards.app/auth/callback' }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const actionLink = data.properties?.action_link
    const url = new URL(actionLink)
    const otpToken = url.searchParams.get('token')
    const code = (otpToken ?? '').replace(/[^0-9]/g, '').slice(0, 6).padEnd(6, '0')

    await supabase.from('otp_codes').upsert({
      email,
      code,
      token: otpToken,
      expires_at: new Date(Date.now() + 3600000).toISOString()
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@mystandards.app',
        to: email,
        subject: 'Ton code MiroirStats',
        html: `
          <div style="background:#0A0A0F;padding:40px;font-family:sans-serif;color:#e5e2dd;max-width:480px;margin:0 auto;border-radius:16px">
            <h1 style="color:#C8FF00;font-size:28px;margin-bottom:8px">MIROIR</h1>
            <p style="color:#8e9479;margin-bottom:32px">Ton code de connexion :</p>
            <div style="background:rgba(200,255,0,0.1);border:1px solid rgba(200,255,0,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <span style="font-size:48px;font-weight:800;color:#C8FF00;letter-spacing:0.2em">${code}</span>
            </div>
            <p style="color:#8e9479;font-size:13px">Ce code expire dans 1 heure.</p>
          </div>
        `
      })
    })

    return NextResponse.json({ success: true })
  }

  if (action === 'verify') {
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
    }

    const { data: userData } = await supabase.auth.admin.getUserByEmail(email)
    let userId = userData?.user?.id

    if (!userId) {
      const { data: newUser } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      })
      userId = newUser?.user?.id
    } else {
      await supabase.auth.admin.updateUserById(userId, { email_confirm: true })
    }

    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    await supabase.from('otp_codes').delete().eq('email', email)

    const actionLink = linkData?.properties?.action_link

    return NextResponse.json({ success: true, actionLink })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}