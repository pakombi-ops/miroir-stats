import { NextRequest, NextResponse } from 'next/server'
import { stripe, CREDIT_PACKS, PackId } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { packId, recipientEmail } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const pack = CREDIT_PACKS[packId as PackId]
    if (!pack) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: pack.name,
              description: pack.description,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        pack_id: packId,
        credits: pack.credits,
        recipient_email: recipientEmail ?? '',
        is_gift: 'isGift' in pack && pack.isGift ? 'true' : 'false',
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}
