'use client'
import { useEffect, useRef, useState } from 'react'
import { AnalysisResult, formatPercentage } from '@/lib/types'

interface ResultCardProps {
  result: AnalysisResult | null
  loading: boolean
  accentColor: 'lime' | 'blue'
  label: string
  onNext?: () => void
  nextLabel?: string
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(value)
  const raf = useRef<number | null>(null)
  const prev = useRef(value)

  useEffect(() => {
    const start = prev.current
    const end = value
    const duration = 900
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setDisplay(start + (end - start) * ease)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = end
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value])

  return (
    <div className="flex items-baseline justify-center gap-1 mb-3" style={{overflow:'visible'}}>
      <span style={{
        fontFamily:'Syne', fontSize:'clamp(64px, 20vw, 96px)', fontWeight:800,
        letterSpacing:'-0.04em', lineHeight:1,
        color, filter:`drop-shadow(0 0 20px ${color}4D)`,
        whiteSpace:'nowrap'
      }}>
        {formatPercentage(display)}
      </span>
      <span style={{
        fontFamily:'Syne', fontSize:'36px', fontWeight:800,
        color, opacity:0.5, lineHeight:1
      }}>%</span>
    </div>
  )
}

const CONFIDENCE_STYLES = {
  'élevé':  { dot: '#a8d700', label: 'Confiance élevée' },
  'moyen':  { dot: '#FFB800', label: 'Confiance moyenne' },
  'faible': { dot: '#FF5C4D', label: 'Confiance faible' },
}

export default function ResultCard({ result, loading, accentColor, label, onNext, nextLabel }: ResultCardProps) {
  const accent    = accentColor === 'lime' ? '#C8FF00' : '#74d1ff'
  const accentDim = accentColor === 'lime' ? '#a8d700' : '#4db8e8'

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up px-1">
        <div className="loading-shimmer h-8 rounded w-48 mx-auto" />
        <div className="loading-shimmer h-24 rounded-xl" />
        <div className="loading-shimmer h-4 rounded w-2/3 mx-auto" />
        <div className="loading-shimmer h-1.5 rounded-full" />
        <div className="loading-shimmer h-48 rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--outline)" strokeWidth="1" opacity={0.3}>
          <circle cx="12" cy="12" r="3"/>
          <circle cx="12" cy="12" r="6" strokeDasharray="2 2"/>
          <circle cx="12" cy="12" r="9" strokeDasharray="1 3"/>
        </svg>
        <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'var(--outline)'}}>
          Sélectionne tes critères et lance l'analyse
        </p>
      </div>
    )
  }

  const conf = CONFIDENCE_STYLES[result.confidence] ?? CONFIDENCE_STYLES['moyen']
  const rarityWidth = Math.min(100, Math.max(0.5, Math.log10(result.percentage + 0.00001) * 16 + 80))

  // Extrait des mots-clés du raisonnement pour les tags
  const tags = result.reasoning
    .split(/[.,]/)
    .slice(0, 2)
    .map(s => s.trim().split(' ').slice(0, 3).join(' '))
    .filter(s => s.length > 4)

  return (
    <div className="animate-fade-in-up" style={{paddingBottom:'8px'}}>

      {/* Hero % — oversize editorial */}
      <div className="text-center mb-10" style={{overflow:'visible'}}>
        <p style={{
          fontFamily:'DM Sans', fontSize:'12px', fontWeight:500,
          letterSpacing:'0.1em', color:'var(--outline)',
          textTransform:'uppercase', marginBottom:'16px'
        }}>
          {label}
        </p>
        <div style={{overflow:'visible', marginLeft:'-20px', marginRight:'-20px'}}>
          <AnimatedNumber value={result.percentage} color={accent} />
        </div>
        <p style={{fontFamily:'DM Sans', fontSize:'16px', color:'var(--on-surface-variant)', fontStyle:'italic', marginTop:'8px'}}>
          soit environ <span style={{color:'var(--on-surface)', fontWeight:500}}>{result.count}</span> personnes dans le monde
        </p>
      </div>

      {/* Barre de rareté */}
      <div style={{marginBottom:'40px'}}>
        <div className="flex justify-between items-center" style={{marginBottom:'12px'}}>
          <span style={{fontFamily:'DM Sans', fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color: accentDim}}>Rare</span>
          <span style={{fontFamily:'DM Sans', fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color:'var(--outline)'}}>Commun</span>
        </div>
        <div style={{
          height:'6px', width:'100%', borderRadius:'999px',
          background:'var(--bg-container)', border:'1px solid rgba(255,255,255,0.05)',
          padding:'1px', overflow:'hidden'
        }}>
          <div style={{
            height:'100%', borderRadius:'999px',
            width:`${rarityWidth}%`,
            background: accent,
            boxShadow:`0 0 8px ${accent}99`,
            transition:'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)'
          }} />
        </div>
      </div>

      {/* Carte raisonnement */}
      <div style={{
        background:'var(--bg-container)', border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:'16px', padding:'24px',
        position:'relative', overflow:'hidden',
        marginBottom:'32px'
      }}>
        {/* Glow coin */}
        <div style={{
          position:'absolute', top:0, right:0,
          width:'128px', height:'128px',
          background:`${accent}0D`,
          borderRadius:'50%', marginRight:'-64px', marginTop:'-64px',
          filter:'blur(40px)', pointerEvents:'none'
        }}/>

        <h3 style={{
          fontFamily:'Syne', fontSize:'20px', fontWeight:700,
          color:'var(--on-surface)', marginBottom:'16px'
        }}>
          Analyse de la rareté
        </h3>

        <p style={{
          fontFamily:'DM Sans', fontSize:'14px', fontWeight:300,
          color:'var(--on-surface-variant)', lineHeight:'1.7',
          marginBottom:'20px'
        }}>
          {result.reasoning}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{marginBottom:'24px'}}>
            {tags.map((tag, i) => (
              <span key={i} style={{
                background:'var(--bg-high)', border:'1px solid rgba(255,255,255,0.05)',
                padding:'4px 14px', borderRadius:'999px',
                fontFamily:'DM Sans', fontSize:'12px', fontWeight:500,
                letterSpacing:'0.05em', color:'var(--on-surface-variant)',
                fontStyle:'italic'
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Confiance + info */}
        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{
            display:'flex', alignItems:'center', gap:'8px',
            background:'var(--bg-low)', border:'1px solid rgba(255,255,255,0.05)',
            padding:'6px 12px', borderRadius:'999px'
          }}>
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background: conf.dot, boxShadow:`0 0 6px ${conf.dot}`}} />
            <span style={{fontFamily:'DM Sans', fontSize:'11px', fontWeight:500, letterSpacing:'0.1em', color:'var(--on-surface)'}}>
              {conf.label}
            </span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{color:'var(--outline-variant)'}}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2"/>
            <line x1="12" y1="11" x2="12" y2="16"/>
          </svg>
        </div>
      </div>

      {/* Bloc data viz atmosphérique */}
      <div style={{
        width:'100%', aspectRatio:'16/9',
        background:'var(--bg-lowest)', border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:'16px', marginBottom:'40px',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden'
      }}>
        {/* Grille de fond */}
        <svg style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.08}} viewBox="0 0 400 225" preserveAspectRatio="none">
          {[0,1,2,3,4].map(i => (
            <line key={`h${i}`} x1="0" y1={i*56} x2="400" y2={i*56} stroke="white" strokeWidth="0.5"/>
          ))}
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="225" stroke="white" strokeWidth="0.5"/>
          ))}
        </svg>
        {/* Courbe stylisée */}
        <svg style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.3}} viewBox="0 0 400 225" preserveAspectRatio="none">
          <path d="M 0 200 Q 100 180 150 140 Q 200 100 220 80 Q 260 40 300 60 Q 350 80 400 50"
            fill="none" stroke={accent} strokeWidth="1.5"/>
          <path d="M 0 200 Q 100 180 150 140 Q 200 100 220 80 Q 260 40 300 60 Q 350 80 400 50 L 400 225 L 0 225 Z"
            fill={accent} opacity="0.05"/>
        </svg>
        {/* Label central */}
        <div style={{zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accentDim} strokeWidth="1" opacity={0.6}>
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="12" r="6" strokeDasharray="2 2"/>
            <circle cx="12" cy="12" r="9" strokeDasharray="1 3"/>
          </svg>
          <p style={{fontFamily:'DM Sans', fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color:'var(--outline)'}}>
            Génération du miroir statistique...
          </p>
        </div>
      </div>

      {/* Boutons */}
      {onNext && (
        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <button onClick={onNext}
            style={{
              width:'100%', height:'56px', borderRadius:'12px',
              background: accent, color: accentColor === 'lime' ? '#161f00' : '#003548',
              fontFamily:'DM Sans', fontSize:'18px', fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              border:'none', cursor:'pointer', transition:'all 0.2s'
            }}>
            {nextLabel ?? 'Continuer'}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="13 6 19 12 13 18"/>
            </svg>
          </button>
          <button
            style={{
              width:'100%', height:'56px', borderRadius:'12px',
              background:'transparent', color:'var(--on-surface)',
              fontFamily:'DM Sans', fontSize:'18px', fontWeight:500,
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'1px solid rgba(142,148,121,0.4)', cursor:'pointer', transition:'all 0.2s'
            }}>
            Modifier les critères
          </button>
        </div>
      )}
    </div>
  )
}