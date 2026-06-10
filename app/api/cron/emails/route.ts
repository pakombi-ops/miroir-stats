import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Vérifie le secret cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()
  const now = new Date()

  // Utilisateurs inscrits il y a 2 jours (±1 heure)
  const j2Start = new Date(now.getTime() - (2 * 24 + 1) * 3600000).toISOString()
  const j2End = new Date(now.getTime() - (2 * 24 - 1) * 3600000).toISOString()

  // Utilisateurs inscrits il y a 7 jours (±1 heure)
  const j7Start = new Date(now.getTime() - (7 * 24 + 1) * 3600000).toISOString()
  const j7End = new Date(now.getTime() - (7 * 24 - 1) * 3600000).toISOString()

  // Récupère les utilisateurs J+2
  const { data: j2Users } = await supabase
    .from('profiles')
    .select('id, email')
    .gte('created_at', j2Start)
    .lte('created_at', j2End)

  // Récupère les utilisateurs J+7
  const { data: j7Users } = await supabase
    .from('profiles')
    .select('id, email')
    .gte('created_at', j7Start)
    .lte('created_at', j7End)

  // Envoie emails J+2
  for (const user of j2Users ?? []) {
    await sendEmail(user.email, 'j2')
  }

  // Envoie emails J+7
  for (const user of j7Users ?? []) {
    await sendEmail(user.email, 'j7')
  }

  return NextResponse.json({ 
    success: true, 
    j2: j2Users?.length ?? 0, 
    j7: j7Users?.length ?? 0 
  })
}

async function sendEmail(email: string, type: 'j2' | 'j7') {
  const templates = {
    j2: {
      subject: '👀 Tu n\'as pas encore vu ton ratio — MiroirStats',
      html: `
        <div style="background:#0A0A0F;padding:40px;font-family:sans-serif;color:#e5e2dd;max-width:480px;margin:0 auto;border-radius:16px">
          <h1 style="color:#C8FF00;font-size:28px;margin-bottom:4px;font-weight:900">MIROIR</h1>
          <p style="color:#8e9479;font-style:italic;margin-bottom:32px;margin-top:0">Tes standards face à la réalité.</p>
          
          <h2 style="font-size:22px;font-weight:700;margin-bottom:16px;color:#e5e2dd">Tes crédits t'attendent encore 👋</h2>
          
          <p style="font-size:16px;color:#8e9479;line-height:1.7;margin-bottom:24px">
            Tu t'es inscrit(e) il y a 2 jours mais tu n'as pas encore découvert ton ratio d'exigence.<br/><br/>
            Il ne faut que 2 minutes. Et le résultat risque de te surprendre.
          </p>

          <div style="background:rgba(255,92,77,0.08);border:1px solid rgba(255,92,77,0.2);border-radius:12px;padding:20px;margin-bottom:32px">
            <p style="margin:0;font-size:15px;color:#FF5C4D;font-weight:700;text-align:center">
              La moyenne des utilisateurs cherche quelqu'un <span style="font-size:20px">28x</span> plus rare qu'eux.
            </p>
            <p style="margin:8px 0 0;font-size:14px;color:#8e9479;text-align:center">
              Quel est ton chiffre à toi ?
            </p>
          </div>

          <a href="https://www.mystandards.app/app-main" style="display:block;background:#C8FF00;color:#161f00;padding:16px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;text-align:center">
            Découvrir mon ratio →
          </a>

          <p style="color:#8e9479;font-size:12px;margin-top:32px;text-align:center;opacity:0.5">
            MiroirStats · mystandards.app
          </p>
        </div>
      `
    },
    j7: {
      subject: '🎯 Offre spéciale — 60 crédits pour aller plus loin',
      html: `
        <div style="background:#0A0A0F;padding:40px;font-family:sans-serif;color:#e5e2dd;max-width:480px;margin:0 auto;border-radius:16px">
          <h1 style="color:#C8FF00;font-size:28px;margin-bottom:4px;font-weight:900">MIROIR</h1>
          <p style="color:#8e9479;font-style:italic;margin-bottom:32px;margin-top:0">Tes standards face à la réalité.</p>
          
          <h2 style="font-size:22px;font-weight:700;margin-bottom:16px;color:#e5e2dd">Prêt(e) à aller plus loin ? 🚀</h2>
          
          <p style="font-size:16px;color:#8e9479;line-height:1.7;margin-bottom:24px">
            Tu utilises MiroirStats depuis une semaine. Si tu veux explorer différents profils, comparer des scénarios ou offrir l'analyse à un ami...
          </p>

          <div style="background:rgba(200,255,0,0.08);border:1px solid rgba(200,255,0,0.2);border-radius:12px;padding:20px;margin-bottom:32px;text-align:center">
            <p style="margin:0;font-size:13px;color:#8e9479;letter-spacing:0.1em;text-transform:uppercase">Pack Explorateur</p>
            <p style="margin:8px 0;font-size:40px;font-weight:900;color:#C8FF00">60 crédits</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#e5e2dd">5,99 €</p>
            <p style="margin:4px 0 0;font-size:12px;color:#8e9479">Sans abonnement · Sans expiration</p>
          </div>

          <a href="https://www.mystandards.app/pricing" style="display:block;background:#C8FF00;color:#161f00;padding:16px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;text-align:center">
            Obtenir 60 crédits →
          </a>

          <p style="color:#8e9479;font-size:12px;margin-top:32px;text-align:center;opacity:0.5">
            MiroirStats · mystandards.app<br/>
            <a href="https://www.mystandards.app/privacy" style="color:#8e9479">Se désabonner</a>
          </p>
        </div>
      `
    }
  }

  const template = templates[type]
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@mystandards.app',
      to: email,
      subject: template.subject,
      html: template.html
    })
  })
}