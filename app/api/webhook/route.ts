import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const CREDITS_MAP: Record<string, number> = {
  'price_1TeKVQAy1q5oBZPbPnmdvasi': 20,  // Pack Analyse
  'price_1TeKVwAy1q5oBZPbxGZHBsbc': 60,  // Pack Explorateur
  'price_1TeKWTAy1q5oBZPb2XjiBGY5': 3,   // Cadeau Viral
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const priceId = session.metadata?.price_id
    const creditsToAdd = priceId ? CREDITS_MAP[priceId] : 0

    if (userId && creditsToAdd > 0) {
      const supabase = await createAdminClient()

      await supabase.from('credits')
        .update({
          balance: supabase.rpc('increment_balance', { amount: creditsToAdd }),
          total_purchased: supabase.rpc('increment_purchased', { amount: creditsToAdd }),
        })
        .eq('user_id', userId)

      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'purchase',
        amount: creditsToAdd,
        stripe_session_id: session.id,
        price_id: priceId,
      })
    }
  }

  return NextResponse.json({ received: true })
}

