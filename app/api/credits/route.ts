import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ balance: 0, authenticated: false })
  }

  const { data, error } = await supabase
    .from('credits')
    .select('balance, total_purchased, total_used')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }

  return NextResponse.json({ ...data, authenticated: true, userId: user.id })
}
