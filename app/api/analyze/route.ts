import { NextResponse } from 'next/server'

// Safety closure only. No body, cookie, database or paid-model access.
export async function POST() {
  return NextResponse.json(
    { error: 'Calcul temporairement indisponible', code: 'LEGACY_ANALYSIS_VALIDATION_PENDING' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
