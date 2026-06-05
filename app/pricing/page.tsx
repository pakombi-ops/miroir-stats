'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PACKS = [
  {
    id: 'analyse',
    priceId: 'price_1TeKVQAy1q5oBZPbPnmdvasi',
    name: 'Pack Analyse',
    price: '2,99 €',
    credits: 20,
    description: 'Pour explorer plusieurs profils',
    accent: '#C8FF00',
    popular: false,
  },
  {
    id: 'explorateur',
    priceId: 'price_1TeKVwAy1q5oBZPbxGZHBsbc',
    name: 'Pack Explorateur',
    price: '5,99 €',
    credits: 60,
    description: 'Le meilleur rapport qualité/crédit',
    accent: '#C8FF00',
    popular: true,
  },
  {
    id: 'cadeau',
    priceId: 'price_1TeKWTAy1q5oBZPb2XjiBGY5',
    name: 'Cadeau Viral',
    price: '1,99 €',
    credits: 3,
    description: 'Offre 3 crédits à un(e) ami(e)',
    accent: '#74d1ff',
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleBuy = async (priceId: string, packId: string) => {
    setLoading(packId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (res.status === 401) { router.push('/login'); return }
      if (data.url) window.location.href = data.url
    } catch { setLoading(null) }
  }

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#0A0A0F', padding:'24px'}}>

      {/* Header */}
      <div style={{textAlign:'center', marginBottom:'40px', paddingTop:'40px'}}>
        <button onClick={() => router.back()}
          style={{position:'absolute', left:'20px', top:'24px', background:'none', border:'none', color:'#8e9479', cursor:'pointer', fontSize:'24px'}}>
          ‹
        </button>
        <h1 style={{fontFamily:'Syne', fontSize:'28px', fontWeight:800, color:'#C8FF00', letterSpacing:'-0.02em'}}>
          Crédits
        </h1>
        <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'#8e9479', marginTop:'6px'}}>
          Sans abonnement. Sans expiration.
        </p>
      </div>

      {/* Packs */}
      <div style={{display:'flex', flexDirection:'column', gap:'16px', maxWidth:'420px', margin:'0 auto'}}>
        {PACKS.map(pack => (
          <div key={pack.id} style={{
            background: pack.popular ? 'rgba(200,255,0,0.05)' : '#17171F',
            border: `1px solid ${pack.popular ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius:'16px', padding:'20px',
            position:'relative'
          }}>
            {pack.popular && (
              <div style={{
                position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)',
                background:'#C8FF00', color:'#161f00',
                fontFamily:'DM Sans', fontSize:'11px', fontWeight:700,
                padding:'3px 12px', borderRadius:'999px', letterSpacing:'0.08em'
              }}>
                MEILLEURE OFFRE
              </div>
            )}

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px'}}>
              <div>
                <p style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, color:'#e5e2dd', margin:0}}>
                  {pack.name}
                </p>
                <p style={{fontFamily:'DM Sans', fontSize:'13px', color:'#8e9479', marginTop:'4px'}}>
                  {pack.description}
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontFamily:'Syne', fontSize:'22px', fontWeight:800, color: pack.accent, margin:0}}>
                  {pack.price}
                </p>
              </div>
            </div>

            <div style={{
              display:'flex', alignItems:'center', gap:'8px',
              marginBottom:'16px', padding:'8px 12px', borderRadius:'8px',
              background:'rgba(255,255,255,0.03)'
            }}>
              <div style={{width:'6px', height:'6px', borderRadius:'50%', background: pack.accent}} />
              <span style={{fontFamily:'DM Sans', fontSize:'13px', color:'#e5e2dd', fontWeight:500}}>
                {pack.credits} crédits
              </span>
              <span style={{fontFamily:'DM Sans', fontSize:'12px', color:'#8e9479'}}>
                = {pack.credits} analyses
              </span>
            </div>

            <button
              onClick={() => handleBuy(pack.priceId, pack.id)}
              disabled={loading === pack.id}
              style={{
                width:'100%', height:'48px', borderRadius:'10px',
                background: loading === pack.id ? 'rgba(200,255,0,0.4)' : pack.accent,
                color:'#161f00', fontFamily:'Syne', fontSize:'15px', fontWeight:700,
                border:'none', cursor: loading === pack.id ? 'not-allowed' : 'pointer',
                transition:'all 0.2s'
              }}>
              {loading === pack.id ? 'Chargement…' : `Obtenir ${pack.credits} crédits`}
            </button>
          </div>
        ))}
      </div>

      <p style={{textAlign:'center', fontFamily:'DM Sans', fontSize:'11px', color:'#8e9479', opacity:0.5, marginTop:'32px'}}>
        Paiement sécurisé par Stripe. Crédits sans expiration.
      </p>
    </div>
  )
}