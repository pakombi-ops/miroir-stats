import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { ratio, userId } = await request.json()

    if (ratio === undefined || ratio === null) {
      return NextResponse.json({ error: 'Ratio manquant' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Mettre à jour le ratio sur les deux lignes search+self de cet utilisateur
    // (les plus récentes, sans ratio encore calculé)
    if (userId) {
      await supabase.rpc('update_user_ratio', { p_user_id: userId, p_ratio: ratio })
    }

    // Récupérer les stats sociales
    const { data, error } = await supabase.rpc('get_social_stats', { p_ratio: ratio })

    if (error) {
      console.error('get_social_stats error:', error)
      return NextResponse.json({ error: 'Erreur stats' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Social stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
