'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNative, setIsNative] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const ua = window.navigator.userAgent
    setIsNative(ua.includes('wv') || ua.includes('WebView'))

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/app-main')
      }
    })
  }, [])

  const handleSend = async () => {
    if (!email) return
    setLoading(true); setError('')

    if (isNative) {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'send' })
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Erreur envoi OTP')
      else setSent(true)
    } else {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Erreur envoi email')
      else setSent(true)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
  if (!otp || otp.length !== 6) return
  setLoading(true); setError('')

  const res = await fetch('/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, action: 'verify', token: otp })
  })
  const data = await res.json()

  if (!res.ok) {
    setError(data.error || 'Code incorrect')
    setLoading(false)
    return
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Vérifie le token directement dans le WebView
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: data.token,
    type: data.type as any
  })

  if (verifyError || !verifyData.session) {
    setError('Erreur de connexion')
    setLoading(false)
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', verifyData.session.user.id)
    .single()

  if (profile?.onboarding_done) router.replace('/app-main')
  else router.replace('/onboarding')

  setLoading(false)
}

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      justifyContent:'center', alignItems:'center',
      backgroundColor:'#0A0A0F', padding:'24px'
    }}>
      <div style={{width:'100%', maxWidth:'380px'}}>

        <div style={{textAlign:'center', marginBottom:'48px'}}>
          <h1 style={{fontFamily:'Syne', fontSize:'36px', fontWeight:800, color:'#C8FF00', letterSpacing:'-0.02em'}}>
            MIROIR
          </h1>
          <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479', fontStyle:'italic', marginTop:'4px'}}>
            Tes standards face à la réalité.
          </p>
        </div>

        {!sent ? (
          <>
            <div style={{marginBottom:'32px', textAlign:'center'}}>
              <p style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, color:'#e5e2dd', marginBottom:'8px'}}>
                Commence ton analyse
              </p>
              <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479'}}>
                {isNative
                  ? "Entre ton email — on t'envoie un code à 6 chiffres."
                  : "Entre ton email — on t'envoie un lien magique. Pas de mot de passe."}
              </p>
            </div>

            <div style={{marginBottom:'16px'}}>
              <input
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{
                  width:'100%', height:'56px', borderRadius:'12px',
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  color:'#e5e2dd', fontFamily:'DM Sans', fontSize:'16px',
                  padding:'0 16px', outline:'none', boxSizing:'border-box'
                }}
              />
            </div>

            {error && (
              <p style={{color:'#FF5C4D', fontSize:'13px', fontFamily:'DM Sans', marginBottom:'12px', textAlign:'center'}}>
                {error}
              </p>
            )}

            <button onClick={handleSend} disabled={loading || !email}
              style={{
                width:'100%', height:'56px', borderRadius:'12px',
                background: loading || !email ? 'rgba(200,255,0,0.4)' : '#C8FF00',
                color:'#161f00', fontFamily:'Syne', fontSize:'16px', fontWeight:700,
                border:'none', cursor: loading || !email ? 'not-allowed' : 'pointer',
                transition:'all 0.2s'
              }}>
              {loading ? 'Envoi en cours…' : isNative ? 'Recevoir mon code →' : 'Recevoir mon lien →'}
            </button>

            <div style={{
              marginTop:'24px', padding:'12px 16px', borderRadius:'10px',
              background:'rgba(200,255,0,0.05)', border:'1px solid rgba(200,255,0,0.15)',
              display:'flex', alignItems:'center', gap:'10px'
            }}>
              <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#C8FF00', flexShrink:0}} />
              <p style={{fontFamily:'DM Sans', fontSize:'13px', color:'#8e9479', margin:0}}>
                <span style={{color:'#C8FF00', fontWeight:600}}>3 crédits offerts</span> à l'inscription — aucune carte requise.
              </p>
            </div>
          </>
        ) : (
          <div style={{textAlign:'center'}}>
            <div style={{
              width:'64px', height:'64px', borderRadius:'50%',
              background:'rgba(200,255,0,0.1)', border:'1px solid rgba(200,255,0,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 24px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            {isNative ? (
              <>
                <p style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, color:'#e5e2dd', marginBottom:'8px'}}>
                  Entre ton code
                </p>
                <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479', lineHeight:'1.6', marginBottom:'32px'}}>
                  Code envoyé à<br/>
                  <span style={{color:'#e5e2dd', fontWeight:500}}>{email}</span>
                </p>

                <input
                  type="number"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.slice(0, 6))}
                  style={{
                    width:'100%', height:'64px', borderRadius:'12px',
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(200,255,0,0.3)',
                    color:'#C8FF00', fontFamily:'Syne', fontSize:'32px',
                    fontWeight:700, textAlign:'center',
                    outline:'none', boxSizing:'border-box',
                    letterSpacing:'0.2em', marginBottom:'16px'
                  }}
                />

                {error && (
                  <p style={{color:'#FF5C4D', fontSize:'13px', fontFamily:'DM Sans', marginBottom:'12px'}}>
                    {error}
                  </p>
                )}

                <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
                  style={{
                    width:'100%', height:'56px', borderRadius:'12px',
                    background: loading || otp.length !== 6 ? 'rgba(200,255,0,0.4)' : '#C8FF00',
                    color:'#161f00', fontFamily:'Syne', fontSize:'16px', fontWeight:700,
                    border:'none', cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                    transition:'all 0.2s', marginBottom:'16px'
                  }}>
                  {loading ? 'Vérification…' : 'Valider mon code →'}
                </button>

                <button onClick={() => { setSent(false); setOtp(''); setError('') }}
                  style={{
                    background:'none', border:'none', color:'#8e9479',
                    fontFamily:'DM Sans', fontSize:'13px', cursor:'pointer',
                    textDecoration:'underline'
                  }}>
                  Renvoyer le code
                </button>
              </>
            ) : (
              <>
                <p style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, color:'#e5e2dd', marginBottom:'8px'}}>
                  Vérifie ta boîte mail
                </p>
                <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479', lineHeight:'1.6'}}>
                  On a envoyé un lien magique à<br/>
                  <span style={{color:'#e5e2dd', fontWeight:500}}>{email}</span>
                </p>
                <button onClick={() => setSent(false)}
                  style={{
                    marginTop:'32px', background:'none', border:'none',
                    color:'#8e9479', fontFamily:'DM Sans', fontSize:'13px',
                    cursor:'pointer', textDecoration:'underline'
                  }}>
                  Changer d'email
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}