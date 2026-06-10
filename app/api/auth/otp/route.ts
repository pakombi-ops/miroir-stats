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

    const { data: { users } } = await supabase.auth.admin.listUsers()
const existingUser = users.find(u => u.email === email)
let userId = existingUser?.id

// Vérifie si le profil existe (indicateur plus fiable de "nouvel utilisateur")
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('id, onboarding_done')
  .eq('id', userId ?? '')
  .single()

const isNewUser = !existingProfile

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

    // Email de bienvenue pour les nouveaux utilisateurs
    if (isNewUser) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'noreply@mystandards.app',
          to: email,
          subject: '🎁 Tes 3 crédits t\'attendent — MiroirStats',
          html: `
            <div style="background:#0A0A0F;padding:40px;font-family:sans-serif;color:#e5e2dd;max-width:480px;margin:0 auto;border-radius:16px">
              <h1 style="color:#C8FF00;font-size:28px;margin-bottom:4px;font-weight:900">MIROIR</h1>
              <p style="color:#8e9479;font-style:italic;margin-bottom:32px;margin-top:0">Tes standards face à la réalité.</p>
              
              <h2 style="font-size:22px;font-weight:700;margin-bottom:16px;color:#e5e2dd">Bienvenue 👋</h2>
              
              <p style="font-size:16px;color:#8e9479;line-height:1.7;margin-bottom:24px">
                Ton compte est créé. Tu as <strong style="color:#C8FF00">3 crédits gratuits</strong> pour découvrir ton ratio d'exigence.
              </p>

              <div style="background:rgba(200,255,0,0.08);border:1px solid rgba(200,255,0,0.2);border-radius:12px;padding:20px;margin-bottom:32px">
                <p style="margin:0;font-size:14px;color:#C8FF00;font-weight:700">Comment ça marche :</p>
                <p style="margin:8px 0 0;font-size:14px;color:#8e9479;line-height:1.6">
                  1. Définis ce que tu cherches chez un partenaire<br/>
                  2. Décris qui tu es toi-même<br/>
                  3. Découvre ton ratio d'exigence
                </p>
              </div>

              <a href="https://www.mystandards.app/app-main" style="display:block;background:#C8FF00;color:#161f00;padding:16px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;text-align:center">
                Lancer mon analyse →
              </a>

              <p style="color:#8e9479;font-size:12px;margin-top:32px;text-align:center;opacity:0.5">
                MiroirStats · mystandards.app<br/>
                <a href="https://www.mystandards.app/privacy" style="color:#8e9479">Politique de confidentialité</a>
              </p>
            </div>
          `
        })
      })
    }

    const generatedLink = linkData?.properties?.action_link ?? ''
    const linkUrl = new URL(generatedLink || 'https://placeholder.com')
    const sessionToken = linkUrl.searchParams.get('token')
    const sessionType = linkUrl.searchParams.get('type')

    return NextResponse.json({ 
      success: true, 
      token: sessionToken,
      type: sessionType,
      email
    })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}