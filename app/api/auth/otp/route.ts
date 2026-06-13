import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, action, token, giftToken } = body

  const supabase = await createAdminClient()
  const TEST_EMAIL = 'reviewmystandards@gmail.com'
  const TEST_CODE = '123456'

  if (action === 'send') {

    if (email === TEST_EMAIL) {
      await supabase.from('otp_codes').upsert({
        email,
        code: TEST_CODE,
        token: 'test-token',
        expires_at: new Date(Date.now() + 365 * 24 * 3600000).toISOString() // 1 an
      })
      return NextResponse.json({ success: true })
    }

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
    // Vérifie le code OTP
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

    // Récupère ou crée l'utilisateur
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existingUser = users.find(u => u.email === email)
    let userId = existingUser?.id

    if (!userId) {
      const { data: newUser } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      })
      userId = newUser?.user?.id
    } else {
      await supabase.auth.admin.updateUserById(userId, { email_confirm: true })
    }

    // Vérifie si l'email de bienvenue a déjà été envoyé
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, welcome_email_sent')
      .eq('id', userId ?? '')
      .single()

    const shouldSendWelcome = !profileData?.welcome_email_sent

    // Génère le lien de session
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    // Supprime le code OTP utilisé
    await supabase.from('otp_codes').delete().eq('email', email)

    // Applique le cadeau (uniquement pour les nouveaux utilisateurs)
    if (shouldSendWelcome && giftToken) {
      const { data: gift } = await supabase
        .from('gift_tokens')
        .select('*')
        .eq('token', giftToken)
        .eq('redeemed', false)
        .single()

      if (gift && userId) {
        await supabase.rpc('increment_balance', { user_id: userId, amount: gift.credits_amount })

        await supabase
          .from('gift_tokens')
          .update({ redeemed: true, redeemed_by: userId, redeemed_at: new Date().toISOString() })
          .eq('token', giftToken)
      }
    }

    // Envoie l'email de bienvenue si pas encore envoyé
    if (shouldSendWelcome) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'noreply@mystandards.app',
          to: email,
          subject: '🎁 Tes crédits t\'attendent — MiroirStats',
          html: `
            <div style="background:#0A0A0F;padding:40px;font-family:sans-serif;color:#e5e2dd;max-width:480px;margin:0 auto;border-radius:16px">
              <h1 style="color:#C8FF00;font-size:28px;margin-bottom:4px;font-weight:900">MIROIR</h1>
              <p style="color:#8e9479;font-style:italic;margin-bottom:32px;margin-top:0">Tes standards face à la réalité.</p>
              <h2 style="font-size:22px;font-weight:700;margin-bottom:16px;color:#e5e2dd">Bienvenue 👋</h2>
              <p style="font-size:16px;color:#8e9479;line-height:1.7;margin-bottom:24px">
                Ton compte est créé. Tu as <strong style="color:#C8FF00">${giftToken ? '6 crédits' : '3 crédits'} gratuits</strong> pour découvrir ton ratio d'exigence.
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

      await supabase
        .from('profiles')
        .update({ welcome_email_sent: true })
        .eq('id', userId ?? '')
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