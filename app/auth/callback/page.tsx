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
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      // Vérifie si onboarding déjà vu
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