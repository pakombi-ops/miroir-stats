import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false }, { status: 400 })

  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('gift_tokens')
    .select('redeemed')
    .eq('token', token)
    .single()

  if (error || !data) return NextResponse.json({ valid: false })

  return NextResponse.json({ valid: true, redeemed: data.redeemed })
}