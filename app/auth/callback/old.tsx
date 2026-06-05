'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const token = params.get('token')
      const type = params.get('type')

      console.log('CODE:', code, 'TOKEN:', token, 'TYPE:', type)

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        console.log('EXCHANGE ERROR:', error)
      }

      if (token && type) {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'magiclink'
  })
  console.log('VERIFY OTP DATA:', data)
  console.log('VERIFY OTP ERROR:', error)
  
  // Si token_hash échoue, essaie avec email+token
  if (error) {
    const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
      email: data?.user?.email ?? '',
      token,
      type: 'magiclink'
    })
    console.log('VERIFY OTP2 DATA:', data2)
    console.log('VERIFY OTP2 ERROR:', error2)
  }
}

      const { data: { user } } = await supabase.auth.getUser()
      console.log('USER:', user)

      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_done) router.replace('/app-main')
      else router.replace('/onboarding')
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      backgroundColor:'#0A0A0F', gap:'16px'
    }}>
      <div style={{
        width:'8px', height:'8px', borderRadius:'50%',
        background:'#C8FF00', animation:'pulseDot 1s infinite'
      }}/>
      <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479'}}>
        Connexion en cours…
      </p>
    </div>
  )
}