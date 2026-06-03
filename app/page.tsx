'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden relative" style={{backgroundColor:'var(--bg)'}}>
      <div className="grain-overlay" />

      {/* Glow atmosphérique */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 70%)'}} />

      {/* Header */}
      <header className="pt-16 px-5 text-center z-10">
        <h1 className="font-display-lg-mobile text-primary uppercase tracking-tight mb-2">MIROIR</h1>
        <p className="font-body-md text-outline italic">Tes standards face à la réalité.</p>
      </header>

      {/* Visual central */}
      <main className="flex-grow flex items-center justify-center relative px-5 z-10">
        <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
          {/* Anneau extérieur */}
          <div className="absolute inset-0 rounded-full" style={{border:'1.5px solid rgba(200,255,0,0.25)'}}>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 font-label-caps text-primary-fixed-dim whitespace-nowrap">Ce que tu cherches</div>
          </div>
          {/* Arc actif extérieur */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#C8FF00" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="30 271" strokeDashoffset="0" transform="rotate(-90 50 50)" style={{filter:'drop-shadow(0 0 6px rgba(200,255,0,0.5))'}}/>
          </svg>

          {/* Anneau intérieur */}
          <div className="absolute rounded-full" style={{inset:'18%', border:'1.5px solid rgba(116,209,255,0.2)'}}>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-label-caps text-secondary whitespace-nowrap">Ce que tu es</div>
          </div>
          {/* Arc actif intérieur */}
          <svg className="absolute rounded-full" style={{inset:'18%', width:'64%', height:'64%'}} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#74d1ff" strokeWidth="2" strokeLinecap="round" strokeDasharray="120 182" strokeDashoffset="0" transform="rotate(-90 50 50)" style={{filter:'drop-shadow(0 0 6px rgba(116,209,255,0.4))'}}/>
          </svg>

          {/* Point central */}
          <div className="w-2 h-2 rounded-full z-20" style={{background:'#C8FF00', boxShadow:'0 0 15px rgba(200,255,0,0.8)'}} />

          {/* Lignes de grille */}
          <div className="absolute w-full h-px top-1/2 -translate-y-1/2" style={{background:'rgba(255,255,255,0.04)'}} />
          <div className="absolute h-full w-px left-1/2 -translate-x-1/2" style={{background:'rgba(255,255,255,0.04)'}} />
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="pb-12 px-5 flex flex-col items-center gap-6 z-10">
        <button
          onClick={() => router.push('/app-main')}
          className="w-full py-5 rounded-full font-headline-md flex items-center justify-center gap-3 transition-all active:scale-95"
          style={{background:'#C8FF00', color:'#161f00', boxShadow:'0 0 20px rgba(200,255,0,0.2)'}}>
          Commencer mon analyse
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  <line x1="5" y1="12" x2="19" y2="12"/>
  <polyline points="13 6 19 12 13 18"/>
</svg>
        </button>
        <p className="font-label-caps text-outline text-center opacity-60">Basé sur les données démographiques mondiales</p>
      </footer>
    </div>
  )
}
