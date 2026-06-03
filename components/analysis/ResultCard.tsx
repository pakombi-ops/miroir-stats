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
    <div className="flex items-baseline justify-center gap-1 mb-2">
      <span className="font-display-xl" style={{color, filter:`drop-shadow(0 0 15px ${color}4D)`}}>
        {formatPercentage(display)}
      </span>
      <span className="font-display-lg-mobile" style={{color, opacity:0.5}}>%</span>
    </div>
  )
}

const CONFIDENCE_STYLES = {
  'élevé': { dot: '#a8d700', label: 'Confiance élevée' },
  'moyen': { dot: '#FFB800', label: 'Confiance moyenne' },
  'faible': { dot: '#FF5C4D', label: 'Confiance faible' },
}

export default function ResultCard({ result, loading, accentColor, label, onNext, nextLabel }: ResultCardProps) {
  const accent = accentColor === 'lime' ? '#C8FF00' : '#74d1ff'
  const accentBg = accentColor === 'lime' ? 'rgba(200,255,0,0.05)' : 'rgba(116,209,255,0.05)'

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="loading-shimmer h-24 rounded-xl" />
        <div className="loading-shimmer h-4 rounded w-2/3 mx-auto" />
        <div className="loading-shimmer h-40 rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="material-symbols-outlined" style={{fontSize:'48px', color:'var(--outline)', opacity:0.4}}>blur_on</span>
        <p className="font-body-sm text-outline">Sélectionne tes critères et lance l'analyse</p>
      </div>
    )
  }

  const conf = CONFIDENCE_STYLES[result.confidence] ?? CONFIDENCE_STYLES['moyen']
  const rarityWidth = Math.min(100, Math.max(0.5, Math.log10(result.percentage + 0.00001) * 16 + 80))

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero % */}
      <div className="text-center">
        <p className="font-label-caps text-outline tracking-widest mb-4">{label}</p>
        <AnimatedNumber value={result.percentage} color={accent} />
        <p className="font-body-md text-on-surface-variant italic">
          soit environ <span className="text-on-surface font-medium">{result.count}</span> personnes dans le monde
        </p>
      </div>

      {/* Barre de rareté */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-label-caps" style={{color: accent, fontSize:'11px'}}>Rare</span>
          <span className="font-label-caps text-outline" style={{fontSize:'11px'}}>Commun</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{background:'var(--bg-container)', border:'1px solid rgba(255,255,255,0.05)', padding:'1px'}}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{width:`${rarityWidth}%`, background: accent, boxShadow:`0 0 8px ${accent}99`}} />
        </div>
      </div>

      {/* Carte raisonnement */}
      <div className="rounded-xl p-6 relative overflow-hidden"
        style={{background:'var(--bg-container)', border:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"
          style={{background:`${accent}0D`}} />
        <h3 className="font-headline-md text-on-surface mb-4" style={{fontSize:'18px'}}>Analyse de la rareté</h3>
        <p className="font-body-sm text-on-surface-variant leading-relaxed mb-4">{result.reasoning}</p>
        <div className="pt-4 flex items-center justify-between" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background:'var(--bg-low)', border:'1px solid rgba(255,255,255,0.05)'}}>
            <div className="w-2 h-2 rounded-full" style={{background: conf.dot}} />
            <span className="font-label-caps text-on-surface" style={{fontSize:'11px'}}>{conf.label}</span>
          </div>
          <span className="material-symbols-outlined text-outline-variant" style={{fontSize:'18px'}}>info</span>
        </div>
      </div>

      {/* CTA */}
      {onNext && (
        <button onClick={onNext}
          className="w-full h-14 rounded-xl font-body-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{background: accent, color: accentColor === 'lime' ? '#161f00' : '#003548'}}>
          {nextLabel ?? 'Continuer'}
          <span className="material-symbols-outlined">arrow_right_alt</span>
        </button>
      )}
    </div>
  )
}
