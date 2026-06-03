'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function Home() {
  const router = useRouter()
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0]
      const x = (touch.clientX / window.innerWidth - 0.5) * 15
      const y = (touch.clientY / window.innerHeight - 0.5) * 15
      if (outerRef.current) outerRef.current.style.transform = `rotate(${45 + x}deg)`
      if (innerRef.current) innerRef.current.style.transform = `rotate(${-120 - x * 1.5}deg)`
    }
    window.addEventListener('touchmove', handleTouch, { passive: true })
    return () => window.removeEventListener('touchmove', handleTouch)
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden relative" style={{backgroundColor:'#0A0A0F'}}>

      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px'
      }}/>

      {/* Glow atmosphérique pulsé */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(200,255,0,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'pulseGlow 4s ease-in-out infinite'
      }}/>

      {/* Scanline */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '2px',
        background: 'linear-gradient(to right, transparent, rgba(200,255,0,0.2), transparent)',
        animation: 'scan 4s linear infinite',
        zIndex: 10
      }}/>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .ring-arc {
          border: 1px solid rgba(255,255,255,0.1);
          border-top-color: #C8FF00;
          border-radius: 50%;
          transition: transform 0.5s ease-out;
        }
        .ring-arc-inner {
          border: 1px solid rgba(255,255,255,0.1);
          border-top-color: #74d1ff;
          border-radius: 50%;
          transition: transform 0.5s ease-out;
        }
      `}</style>

      {/* Header */}
      <header className="pt-20 px-5 text-center z-10">
        <h1 style={{fontFamily:'Syne', fontSize:'36px', fontWeight:800, lineHeight:'40px', letterSpacing:'-0.02em', color:'#ffffff', textTransform:'uppercase', marginBottom:'8px'}}>
          MIROIR
        </h1>
        <p style={{fontFamily:'DM Sans', fontSize:'16px', color:'#8e9479', fontStyle:'italic'}}>
          Tes standards face à la réalité.
        </p>
      </header>

      {/* Visual central */}
<main className="flex-grow flex items-center justify-center relative overflow-hidden px-5 z-10">
  <div className="relative flex items-center justify-center" style={{width:'320px', height:'320px'}}>

    {/* Anneau extérieur — Ce que tu cherches (vert) */}
    <div ref={outerRef} className="ring-arc absolute" style={{
      width:'100%', height:'100%',
      borderTopWidth:'2px',
      opacity:0.8,
      transform:'rotate(45deg)'
    }}/>

    {/* Anneau intérieur — Ce que tu es (bleu) */}
    <div ref={innerRef} className="ring-arc-inner absolute" style={{
      width:'65%', height:'65%',
      borderTopWidth:'2px',
      opacity:0.5,
      transform:'rotate(-120deg)'
    }}/>

    {/* Textes courbés en SVG par-dessus */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" style={{overflow:'visible'}}>
      {/* Chemin anneau extérieur (r=158) — texte sur le haut */}
      <defs>
        <path id="outerArc" d="M 160,160 m -158,0 a 158,158 0 1,1 316,0" />
        <path id="innerArc" d="M 160,160 m -103,0 a 103,103 0 1,1 206,0" />
      </defs>

      {/* "CE QUE TU CHERCHES" sur anneau extérieur */}
      <text style={{fontFamily:'DM Sans', fontSize:'11px', fontWeight:500, letterSpacing:'0.12em', fill:'#8e9479', textTransform:'uppercase'}}>
        <textPath href="#outerArc" startOffset="15%">
          CE QUE TU CHERCHES
        </textPath>
      </text>

      {/* "CE QUE TU ES" sur anneau intérieur */}
      <text style={{fontFamily:'DM Sans', fontSize:'11px', fontWeight:500, letterSpacing:'0.12em', fill:'#74d1ff'}}>
        <textPath href="#innerArc" startOffset="20%">
          CE QUE TU ES
        </textPath>
      </text>
    </svg>

    {/* Point central */}
    <div style={{
      width:'4px', height:'4px', borderRadius:'50%',
      background:'#C8FF00',
      boxShadow:'0 0 15px rgba(200,255,0,0.8)',
      zIndex:20
    }}/>

    {/* Lignes de grille */}
    <div className="absolute w-full" style={{height:'1px', background:'rgba(255,255,255,0.05)', top:'50%'}}/>
    <div className="absolute h-full" style={{width:'1px', background:'rgba(255,255,255,0.05)', left:'50%'}}/>
  </div>
</main>

      {/* Footer CTA */}
      <footer className="pb-12 px-5 flex flex-col items-center gap-8 z-10">
        <button
          onClick={() => router.push('/app-main')}
          className="w-full flex items-center justify-center gap-3 transition-all active:scale-95"
          style={{
            background:'#C8FF00', color:'#161f00',
            padding:'20px', borderRadius:'9999px',
            fontFamily:'Syne', fontSize:'24px', fontWeight:700,
            boxShadow:'0 0 20px rgba(200,255,0,0.2)',
            border:'none', cursor:'pointer'
          }}>
          Commencer mon analyse
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="13 6 19 12 13 18"/>
          </svg>
        </button>
        <p style={{fontFamily:'DM Sans', fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color:'#8e9479', opacity:0.6, textTransform:'uppercase', textAlign:'center'}}>
          Basé sur les données démographiques mondiales
        </p>
      </footer>
    </div>
  )
}