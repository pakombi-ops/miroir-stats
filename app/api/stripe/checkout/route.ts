import { NextResponse } from 'next/server'

// Safety closure only. No session, body, database or Stripe access.
export async function POST() {
  return NextResponse.json(
    { error: 'Achats temporairement suspendus pendant la remise en service', code: 'PURCHASES_VALIDATION_PENDING' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
