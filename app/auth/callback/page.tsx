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
  const code = new URLSearchParams(window.location.search).get('code')
  console.log('CODE:', code)
  console.log('HASH:', window.location.hash)
  console.log('SEARCH:', window.location.search)

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('EXCHANGE DATA:', data)
    console.log('EXCHANGE ERROR:', error)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('USER:', user)
  console.log('USER ERROR:', userError)

  if (!user) { router.replace('/login'); return }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .single()

  console.log('PROFILE:', profile)
  console.log('PROFILE ERROR:', profileError)

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