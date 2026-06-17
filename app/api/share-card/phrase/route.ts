import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { ratio, searchPct, selfPct } = await req.json()

    if (!ratio || searchPct === undefined || selfPct === undefined) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 80,
      system: `Tu es le copywriter de MiroirStats, une app qui calcule le "ratio d'exigence" en amour.
Style : percutant, légèrement provocateur, jamais méchant. Humour noir bienveillant.
Génère UNE SEULE phrase en français, max 15 mots. Pas de guillemets, pas d'explication.
La phrase doit être mémorable, shareable, cinglante mais vraie.
Réponds UNIQUEMENT avec la phrase, rien d'autre.`,
      messages: [{
        role: 'user',
        content: `Ratio : ${ratio}x. Je cherche ${searchPct}% de la pop., je représente ${selfPct}%. Génère la phrase choc.`
      }]
    })

    const phrase = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : ''

    return NextResponse.json({ phrase })
  } catch (error) {
    console.error('[share-card/phrase]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
