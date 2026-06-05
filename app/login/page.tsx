'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      justifyContent:'center', alignItems:'center',
      backgroundColor:'#0A0A0F', padding:'24px'
    }}>
      <div style={{width:'100%', maxWidth:'380px'}}>

        {/* Logo */}
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
                Entre ton email — on t'envoie un lien magique. Pas de mot de passe.
              </p>
            </div>

            {/* Champ email */}
            <div style={{marginBottom:'16px'}}>
              <input
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              style={{
                width:'100%', height:'56px', borderRadius:'12px',
                background: loading || !email ? 'rgba(200,255,0,0.4)' : '#C8FF00',
                color:'#161f00', fontFamily:'Syne', fontSize:'16px', fontWeight:700,
                border:'none', cursor: loading || !email ? 'not-allowed' : 'pointer',
                transition:'all 0.2s'
              }}>
              {loading ? 'Envoi en cours…' : 'Recevoir mon lien →'}
            </button>

            {/* Crédits offerts */}
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
            <p style={{fontFamily:'Syne', fontSize:'20px', fontWeight:700, color:'#e5e2dd', marginBottom:'8px'}}>
              Vérifie ta boîte mail
            </p>
            <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479', lineHeight:'1.6'}}>
              On a envoyé un lien magique à<br/>
              <span style={{color:'#e5e2dd', fontWeight:500}}>{email}</span>
            </p>
            <button
              onClick={() => setSent(false)}
              style={{
                marginTop:'32px', background:'none', border:'none',
                color:'#8e9479', fontFamily:'DM Sans', fontSize:'13px',
                cursor:'pointer', textDecoration:'underline'
              }}>
              Changer d'email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}