'use client'
import { AnalysisResult, getComparisonVerdict, formatPercentage } from '@/lib/types'

interface ComparePanelProps {
  searchResult: AnalysisResult | null
  selfResult: AnalysisResult | null
}

export default function ComparePanel({ searchResult, selfResult }: ComparePanelProps) {
  if (!searchResult || !selfResult) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--outline)" strokeWidth="1" strokeLinecap="round" opacity={0.3}>
  <line x1="12" y1="3" x2="12" y2="21"/>
  <path d="M5 7l7-4 7 4"/>
  <path d="M5 7l-3 6a3 3 0 0 0 6 0L5 7z"/>
  <path d="M19 7l-3 6a3 3 0 0 0 6 0L19 7z"/>
</svg>
        <div className="space-y-2">
          <p className="font-headline-md text-on-surface" style={{fontSize:'18px'}}>Complète les deux profils</p>
          <p className="font-body-sm text-outline">Lance une analyse sur "Je cherche" et "Je suis" pour voir ton miroir.</p>
        </div>
      </div>
    )
  }

  const verdict = getComparisonVerdict(searchResult.percentage, selfResult.percentage)
  const ratioStr = verdict.ratio > 100 ? `>${Math.round(verdict.ratio)}x` : `${verdict.ratio.toFixed(1)}x`
  const isHigh = verdict.ratio > 5
  const verdictColor = verdict.ratio <= 0.5 ? '#a8d700' : verdict.ratio <= 1.5 ? '#C8FF00' : verdict.ratio <= 5 ? '#FFB800' : '#FF5C4D'
  const borderColor = verdictColor

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">

      {/* Stat cards côte à côte */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.05)'}}>
          <p className="font-label-caps mb-1" style={{color:'var(--primary-dim)', fontSize:'10px'}}>CE QUE TU CHERCHES</p>
          <p className="font-headline-md" style={{color:'#C8FF00', fontSize:'22px'}}>{formatPercentage(searchResult.percentage)}%</p>
          <p className="font-body-sm text-outline" style={{fontSize:'11px', marginTop:'2px'}}>{searchResult.count}</p>
        </div>
        <div className="rounded-xl p-4" style={{background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.05)'}}>
          <p className="font-label-caps mb-1" style={{color:'rgba(116,209,255,0.6)', fontSize:'10px'}}>CE QUE TU ES</p>
          <p className="font-headline-md" style={{color:'#74d1ff', fontSize:'22px'}}>{formatPercentage(selfResult.percentage)}%</p>
          <p className="font-body-sm text-outline" style={{fontSize:'11px', marginTop:'2px'}}>{selfResult.count}</p>
        </div>
      </div>

      {/* Ratio clé */}
      <div className="flex flex-col items-center py-6">
        <p className="font-label-caps text-outline-variant mb-3">RATIO D'EXIGENCE</p>
        <div className="relative">
          <h2 className="font-display-lg" style={{color: verdictColor, filter:`drop-shadow(0 0 20px ${verdictColor}66)`, lineHeight:1}}>
            {ratioStr}
          </h2>
          {isHigh && (
            <div className="absolute -top-2 -right-6 px-2 py-0.5 rounded font-label-caps" style={{fontSize:'10px', color: verdictColor, background:`${verdictColor}1A`, border:`1px solid ${verdictColor}4D`}}>
              CRITIQUE
            </div>
          )}
        </div>
      </div>

      {/* Barre visuelle */}
      <div className="flex flex-col gap-3">
        <div className="h-1.5 w-full rounded-full relative overflow-visible" style={{background:'rgba(255,255,255,0.05)'}}>
          <div className="absolute top-1/2 left-[5%] -translate-y-1/2 w-4 h-4 rounded-full border-4"
            style={{background:'#74d1ff', borderColor:'var(--bg)', boxShadow:'0 2px 8px rgba(116,209,255,0.3)'}} />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 rounded-full border-4"
            style={{background:'#C8FF00', borderColor:'var(--bg)', boxShadow:'0 0 12px rgba(200,255,0,0.5)'}} />
        </div>
        <div className="flex justify-between px-1">
          <span className="font-label-caps" style={{fontSize:'10px', color:'rgba(116,209,255,0.5)'}}>TOI (RÉEL)</span>
          <span className="font-label-caps" style={{fontSize:'10px', color:'rgba(200,255,0,0.5)'}}>CIBLE (IDÉAL)</span>
        </div>
      </div>

      {/* Verdict */}
      <div className="p-5 rounded-r-xl" style={{background:'var(--bg-card)', borderLeft:`4px solid ${borderColor}`, borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', borderRight:'1px solid rgba(255,255,255,0.05)'}}>
        <h3 className="font-body-lg font-bold text-on-surface mb-2">{verdict.verdictTitle}</h3>
        <p className="font-body-md text-outline leading-relaxed">
          Tu cherches quelqu'un{' '}
          <span style={{color: verdictColor, fontWeight:'bold'}}>{ratioStr} plus rare</span>
          {' '}que toi. {verdict.verdictDesc}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pb-4">
        <button
          onClick={() => {
            const text = `J'ai testé MiroirStats — je cherche ${formatPercentage(searchResult.percentage)}% de la population mais je représente ${formatPercentage(selfResult.percentage)}%. Ratio: ${ratioStr} 👀`
            if (navigator.share) navigator.share({ title: 'Mon MiroirStats', text, url: window.location.origin })
            else navigator.clipboard.writeText(text)
          }}
          className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-label-caps text-on-surface transition-all active:scale-[0.98] hover:bg-white/5"
          style={{border:'1px solid rgba(142,148,121,0.3)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="18" cy="5" r="3"/>
  <circle cx="6" cy="12" r="3"/>
  <circle cx="18" cy="19" r="3"/>
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
</svg>
          PARTAGER MON RÉSULTAT
        </button>
        <button
          className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-label-caps text-on-surface transition-all active:scale-[0.98] hover:bg-white/5"
          style={{border:'1px solid rgba(142,148,121,0.3)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
  <line x1="4" y1="6" x2="20" y2="6"/>
  <line x1="4" y1="12" x2="20" y2="12"/>
  <line x1="4" y1="18" x2="20" y2="18"/>
  <circle cx="8" cy="6" r="2" fill="currentColor"/>
  <circle cx="16" cy="12" r="2" fill="currentColor"/>
  <circle cx="10" cy="18" r="2" fill="currentColor"/>
</svg>
          AJUSTER MES CRITÈRES
        </button>
      </div>

      <p className="text-center font-label-caps text-outline pb-8" style={{fontSize:'10px', opacity:0.4}}>
        Données basées sur les statistiques démographiques mondiales 2024.
      </p>
    </div>
  )
}
