import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { userId, ratio, searchPct, selfPct, viralPhrase } = await req.json()
  const supabase = await createAdminClient()
  
  const token = crypto.randomUUID()
  
  await supabase.from('share_tokens').insert({
    token,
    sender_user_id: userId,
    sender_ratio: ratio,
    sender_search_pct: searchPct,
    sender_self_pct: selfPct,
    viral_phrase: viralPhrase
  })
  
  return NextResponse.json({ url: `https://mystandards.app/r/${token}` })
}