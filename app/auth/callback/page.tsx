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

    // Récupère le token depuis l'URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        router.replace('/app-main')
      })
    } else {
      // Essaie via le code dans l'URL query
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) router.replace('/app-main')
        else router.replace('/login')
      })
    }
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