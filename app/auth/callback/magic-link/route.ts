import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  const supabase = await createAdminClient()
  
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: 'https://www.mystandards.app/auth/callback'
    }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Envoie l'email via Resend directement
  const magicLink = data.properties?.action_link

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@mystandards.app',
      to: email,
      subject: 'Ton lien magique MiroirStats',
      html: `
        <div style="background:#0A0A0F;padding:40px;font-family:sans-serif;color:#e5e2dd;max-width:480px;margin:0 auto;border-radius:16px">
          <h1 style="color:#C8FF00;font-size:28px;margin-bottom:8px">MIROIR</h1>
          <p style="color:#8e9479;font-style:italic;margin-bottom:32px">Tes standards face à la réalité.</p>
          <p style="font-size:16px;margin-bottom:24px">Clique sur le bouton ci-dessous pour te connecter — ce lien expire dans 1 heure.</p>
          <a href="${magicLink}" style="display:inline-block;background:#C8FF00;color:#161f00;padding:16px 32px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none">
            Accéder à MiroirStats →
          </a>
          <p style="color:#8e9479;font-size:12px;margin-top:32px">Si tu n'as pas demandé ce lien, ignore cet email.</p>
        </div>
      `
    })
  })

  if (!res.ok) return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })

  return NextResponse.json({ success: true })
}