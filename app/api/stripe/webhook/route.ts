import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { user_id, pack_id, credits, is_gift, recipient_email } = session.metadata!

    const supabase = await createAdminClient()

    if (is_gift === 'true' && recipient_email) {
      // Créer un token cadeau
      const { error } = await supabase.from('gift_tokens').insert({
        sender_id: user_id,
        recipient_email,
        credits_amount: parseInt(credits),
        stripe_session_id: session.id,
      })
      if (error) console.error('Gift token error:', error)
    } else {
      // Créditer directement le compte
      const { error } = await supabase.rpc('add_credits', {
        p_user_id: user_id,
        p_amount: parseInt(credits),
        p_pack_id: pack_id,
        p_stripe_session_id: session.id,
      })
      if (error) console.error('Add credits error:', error)
    }
  }

  return NextResponse.json({ received: true })
}
