'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function GiftSendContent() {
  const [giftLink, setGiftLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) { router.push('/app-main'); return }

    fetch(`/api/gift/token?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          setGiftLink(`https://www.mystandards.app/cadeau/${data.token}`)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCopy = () => {
    if (!giftLink) return
    navigator.clipboard.writeText(giftLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (!giftLink) return
    const text = `🎁 Je t'offre 3 crédits gratuits sur MiroirStats — découvre ton ratio d'exigence en amour !\n\n${giftLink}`
    if (navigator.share) {
      navigator.share({ title: 'Cadeau MiroirStats', text, url: giftLink }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0A0A0F'}}>
        <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#C8FF00', animation:'pulseDot 1s infinite'}}/>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#0A0A0F', padding:'24px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
      <div style={{maxWidth:'380px', margin:'0 auto', width:'100%', textAlign:'center'}}>

        <div style={{
          width:'80px', height:'80px', borderRadius:'50%',
          background:'rgba(200,255,0,0.1)', border:'1px solid rgba(200,255,0,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 24px', fontSize:'36px'
        }}>
          🎁
        </div>

        <h1 style={{fontFamily:'Syne', fontSize:'28px', fontWeight:800, color:'#e5e2dd', marginBottom:'12px'}}>
          Ton cadeau est prêt !
        </h1>
        <p style={{fontFamily:'DM Sans', fontSize:'15px', color:'#8e9479', lineHeight:'1.6', marginBottom:'32px'}}>
          Partage ce lien avec un(e) ami(e) — il/elle recevra <span style={{color:'#C8FF00', fontWeight:600}}>6 crédits offerts</span> en créant son compte.
        </p>

        {giftLink && (
          <div style={{
            background:'#17171F', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'12px', padding:'16px', marginBottom:'24px',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'
          }}>
            <span style={{fontFamily:'DM Sans', fontSize:'13px', color:'#C8FF00', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {giftLink}
            </span>
            <button onClick={handleCopy} style={{background:'none', border:'none', cursor:'pointer', flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={copied ? '#C8FF00' : '#8e9479'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? <polyline points="20 6 9 17 4 12"/> : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}
              </svg>
            </button>
          </div>
        )}

        <button onClick={handleShare} style={{
          width:'100%', height:'56px', borderRadius:'12px',
          background:'#C8FF00', color:'#161f00',
          fontFamily:'Syne', fontSize:'16px', fontWeight:700,
          border:'none', cursor:'pointer', marginBottom:'16px'
        }}>
          Partager le cadeau →
        </button>

        <button onClick={() => router.push('/app-main')} style={{
          background:'none', border:'none', color:'#8e9479',
          fontFamily:'DM Sans', fontSize:'14px', cursor:'pointer', textDecoration:'underline'
        }}>
          Retour à l'app
        </button>
      </div>

      <style>{`@keyframes pulseDot { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  )
}

export default function GiftSendPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0A0A0F'}}>
        <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#C8FF00'}}/>
      </div>
    }>
      <GiftSendContent />
    </Suspense>
  )
}