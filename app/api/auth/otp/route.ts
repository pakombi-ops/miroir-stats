import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, action, token } = body

  if (action === 'send') {
    const supabase = await createAdminClient()
    
    // Génère un OTP via admin
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'https://www.mystandards.app/auth/callback' }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Extrait le token du lien
    const actionLink = data.properties?.action_link
    const url = new URL(actionLink)
    const otpToken = url.searchParams.get('token')

    // Génère un code 6 chiffres depuis le token
    const code = otpToken?.slice(0, 6).replace(/[^0-9]/g, '').padEnd(6, '0') ?? '000000'

    // Stocke temporairement email + code dans Supabase
    const adminSupabase = await createAdminClient()
    await adminSupabase.from('otp_codes').upsert({
      email,
      code,
      token: otpToken,
      expires_at: new Date(Date.now() + 3600000).toISOString()
    })

    // Envoie via Resend
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
            <p style="color:#8e9479;font-size:13px">Ce code expire dans 1 heure. Si tu n'as pas demandé ce code, ignore cet email.</p>
          </div>
        `
      })
    })

    return NextResponse.json({ success: true })
  }

  if (action === 'verify') {
    const adminSupabase = await createAdminClient()
    
    // Vérifie le code
    const { data: otpData, error: otpError } = await adminSupabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
    }

    // Vérifie le token Supabase
    const { data, error } = await adminSupabase.auth.verifyOtp({
      token_hash: otpData.token,
      type: 'magiclink'
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Supprime le code utilisé
    await adminSupabase.from('otp_codes').delete().eq('email', email)

    return NextResponse.json({ success: true, session: data.session })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}