import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const { priceId, userId } = await request.json()

  let userEmail = ''
  let finalUserId = userId

  // Essaie d'abord via les cookies
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    finalUserId = user.id
    userEmail = user.email ?? ''
  } else if (userId) {
    // Fallback via admin avec userId passé depuis le client
    const adminSupabase = await createAdminClient()
    const { data: { user: adminUser } } = await adminSupabase.auth.admin.getUserById(userId)
    if (adminUser) {
      userEmail = adminUser.email ?? ''
    }
  } else {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app-main?credits=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: userEmail,
    metadata: { user_id: finalUserId, price_id: priceId },
  })

  return NextResponse.json({ url: session.url })
}