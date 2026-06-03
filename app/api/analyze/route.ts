import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'
import { getActiveCriteria } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Tu es un expert en démographie mondiale. Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks, sans texte avant ou après) ayant exactement cette structure :
{"percentage":<nombre décimal entre 0.000001 et 100>,"count":"<estimation ex: ~2,3 millions>","reasoning":"<2-3 phrases factuelles basées sur des données démographiques réelles>","confidence":"<faible|moyen|élevé>"}
IMPORTANT : Si une zone géographique est spécifiée, le percentage ET le count doivent être calculés PAR RAPPORT À LA POPULATION DE CETTE ZONE UNIQUEMENT, pas par rapport à la population mondiale. Par exemple, si la zone est "France" (68 millions), le percentage est sur 68 millions. Utilise des probabilités conditionnelles réalistes. Si aucun critère actif, retourne percentage: 100.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { criteria, profileType, userId } = body

    if (!criteria || !profileType) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (userId) {
      const supabase = await createAdminClient()
      const { data: deducted, error } = await supabase
        .rpc('deduct_credit', { p_user_id: userId })
      if (error || !deducted) {
        return NextResponse.json(
          { error: 'Crédits insuffisants', code: 'NO_CREDITS' },
          { status: 402 }
        )
      }
    }

    // Construire le prompt avec les nouveaux critères
    const filters: string[] = []
    if (criteria.genre && criteria.genre !== 'Tous') filters.push(`- Genre : ${criteria.genre}`)
    if (criteria.ageMin !== undefined && criteria.ageMax !== undefined &&
        (criteria.ageMin !== 18 || criteria.ageMax !== 80)) {
      filters.push(`- Âge : entre ${criteria.ageMin} et ${criteria.ageMax} ans`)
    }
    if (criteria.revenuMin > 0) {
      filters.push(`- Revenu minimum : ${criteria.revenuMin.toLocaleString()} € / ${criteria.revenuType === 'mensuel' ? 'mois' : 'an'}`)
    }
    if (criteria.zone && criteria.zone !== 'Monde entier') filters.push(`- Zone géographique : ${criteria.zone}`)
    if (criteria.ethnie && criteria.ethnie !== 'Toutes') filters.push(`- Origine ethnique : ${criteria.ethnie}`)
    if (criteria.dejaMarie && criteria.dejaMarie !== 'Peu importe') filters.push(`- Statut marital : ${criteria.dejaMarie}`)
    if (criteria.tailleMin > 0) {
      if (criteria.tailleUnit === 'cm') filters.push(`- Taille minimum : ${criteria.tailleMin} cm`)
      else {
        const feet = Math.floor(criteria.tailleMin / 30.48)
        const inches = Math.round((criteria.tailleMin / 30.48 - feet) * 12)
        filters.push(`- Taille minimum : ${feet}'${inches}"`)
      }
    }
    if (criteria.obesite && criteria.obesite !== 'Peu importe') filters.push(`- En obésité : ${criteria.obesite}`)

    const zone = criteria.zone && criteria.zone !== 'Monde entier' ? criteria.zone : null

const userPrompt = filters.length === 0
  ? 'Aucun critère spécifique — population mondiale complète. Retourne percentage: 100.'
  : `Estime le pourcentage de la population ${zone ? `de la zone "${zone}"` : 'mondiale'} correspondant à ces critères :
${filters.join('\n')}

${zone ? `Base de calcul : population de "${zone}" uniquement. Le percentage et le count doivent refléter cette zone, pas le monde entier.` : ''}

Réponds uniquement en JSON strict.`


    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content.find(b => b.type === 'text')?.text ?? '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    if (userId) {
      const supabase = await createAdminClient()
      await supabase.from('analyses').insert({
        user_id: userId,
        profile_type: profileType,
        criteria,
        result,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'analyse' }, { status: 500 })
  }
}