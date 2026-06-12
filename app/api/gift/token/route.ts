import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('gift_tokens')
    .select('token')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ token: data.token })
}