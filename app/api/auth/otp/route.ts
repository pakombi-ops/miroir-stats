import { NextResponse } from 'next/server'
// Custom OTP issuance/session minting, including the public review-account
// bypass, has been removed locally. Native login remains closed until the
// provider's real OTP template, limits and mobile session flow are verified.
export async function POST() {
 return NextResponse.json({success:false,error:'Connexion par code temporairement indisponible',code:'OTP_PROVIDER_VALIDATION_PENDING'},
  {status:503,headers:{'Cache-Control':'no-store'}})
}
