'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GiftReceivePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'redeemed'>('loading')

  useEffect(() => {
    fetch(`/api/gift/check?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.redeemed) setStatus('redeemed')
        else if (data.valid) setStatus('valid')
        else setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const handleClaim = () => {
    // Stocke le token pour le récupérer après inscription
    sessionStorage.setItem('gift_token', token)
    router.push('/login')
  }

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#0A0A0F', padding:'24px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
      <div style={{maxWidth:'380px', margin:'0 auto', width:'100%', textAlign:'center'}}>

        <h1 style={{fontFamily:'Syne', fontSize:'32px', fontWeight:800, color:'#C8FF00', letterSpacing:'-0.02em', marginBottom:'8px'}}>
          MIROIR
        </h1>
        <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479', fontStyle:'italic', marginBottom:'48px'}}>
          Tes standards face à la réalité.
        </p>

        {status === 'loading' && (
          <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#C8FF00', margin:'0 auto', animation:'pulseDot 1s infinite'}}/>
        )}

        {status === 'valid' && (
          <>
            <div style={{
              width:'80px', height:'80px', borderRadius:'50%',
              background:'rgba(200,255,0,0.1)', border:'1px solid rgba(200,255,0,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 24px', fontSize:'36px'
            }}>
              🎁
            </div>
            <h2 style={{fontFamily:'Syne', fontSize:'24px', fontWeight:800, color:'#e5e2dd', marginBottom:'12px'}}>
              Tu as reçu un cadeau !
            </h2>
            <p style={{fontFamily:'DM Sans', fontSize:'15px', color:'#8e9479', lineHeight:'1.6', marginBottom:'32px'}}>
              Crée ton compte et reçois immédiatement <span style={{color:'#C8FF00', fontWeight:700}}>6 crédits offerts</span> pour découvrir ton ratio d'exigence.
            </p>
            <button onClick={handleClaim} style={{
              width:'100%', height:'56px', borderRadius:'12px',
              background:'#C8FF00', color:'#161f00',
              fontFamily:'Syne', fontSize:'16px', fontWeight:700,
              border:'none', cursor:'pointer'
            }}>
              Récupérer mes 6 crédits →
            </button>
          </>
        )}

        {status === 'redeemed' && (
          <>
            <h2 style={{fontFamily:'Syne', fontSize:'24px', fontWeight:800, color:'#e5e2dd', marginBottom:'12px'}}>
              Ce cadeau a déjà été utilisé
            </h2>
            <p style={{fontFamily:'DM Sans', fontSize:'15px', color:'#8e9479', lineHeight:'1.6', marginBottom:'32px'}}>
              Mais tu peux quand même créer ton compte et recevoir 3 crédits offerts !
            </p>
            <button onClick={() => router.push('/login')} style={{
              width:'100%', height:'56px', borderRadius:'12px',
              background:'#C8FF00', color:'#161f00',
              fontFamily:'Syne', fontSize:'16px', fontWeight:700,
              border:'none', cursor:'pointer'
            }}>
              Créer mon compte →
            </button>
          </>
        )}

        {status === 'invalid' && (
          <>
            <h2 style={{fontFamily:'Syne', fontSize:'24px', fontWeight:800, color:'#e5e2dd', marginBottom:'12px'}}>
              Lien invalide
            </h2>
            <p style={{fontFamily:'DM Sans', fontSize:'15px', color:'#8e9479', lineHeight:'1.6', marginBottom:'32px'}}>
              Ce lien n'existe pas ou a expiré. Mais tu peux quand même créer ton compte !
            </p>
            <button onClick={() => router.push('/login')} style={{
              width:'100%', height:'56px', borderRadius:'12px',
              background:'#C8FF00', color:'#161f00',
              fontFamily:'Syne', fontSize:'16px', fontWeight:700,
              border:'none', cursor:'pointer'
            }}>
              Créer mon compte →
            </button>
          </>
        )}
      </div>

      <style>{`@keyframes pulseDot { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  )
}