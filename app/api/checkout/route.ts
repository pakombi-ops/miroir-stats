import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const GIFT_PRICE_ID = 'price_1TeKWTAy1q5oBZPb2XjiBGY5'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const adminSupabase = await createAdminClient()
    const { data: { user }, error } = await adminSupabase.auth.admin.getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 })
    }

    const successUrl = priceId === GIFT_PRICE_ID
      ? `${process.env.NEXT_PUBLIC_APP_URL}/cadeau/envoyer?session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/app-main?credits=success`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: user.email,
      metadata: { user_id: userId, price_id: priceId },
      custom_text: {
        submit: { message: 'Tes crédits seront disponibles immédiatement après le paiement.' }
      },
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('CHECKOUT ERROR:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}