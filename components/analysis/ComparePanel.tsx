'use client'
import { AnalysisResult, getComparisonVerdict, formatPercentage } from '@/lib/types'
import { useState, useEffect } from 'react'

interface ComparePanelProps {
  searchResult: AnalysisResult | null
  selfResult: AnalysisResult | null
  onAdjust?: () => void
  viralPhrase?: string
}

export default function ComparePanel({ searchResult, selfResult, onAdjust, viralPhrase = '' }: ComparePanelProps) {
  const [sharing, setSharing] = useState(false)
  const [phrase, setPhrase] = useState(viralPhrase)

  // Met à jour la phrase quand elle arrive (générée en arrière-plan)
  useEffect(() => {
    if (viralPhrase) setPhrase(viralPhrase)
  }, [viralPhrase])

  if (!searchResult || !selfResult) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', textAlign:'center', gap:'16px'}}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8e9479" strokeWidth="1" opacity={0.3}>
          <line x1="12" y1="3" x2="12" y2="21"/>
          <path d="M5 7l7-4 7 4"/>
          <path d="M5 7l-3 6a3 3 0 0 0 6 0L5 7z"/>
          <path d="M19 7l-3 6a3 3 0 0 0 6 0L19 7z"/>
        </svg>
        <div>
          <p style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, color:'var(--on-surface)', marginBottom:'8px'}}>
            Complète les deux profils
          </p>
          <p style={{fontFamily:'DM Sans', fontSize:'14px', color:'var(--outline)'}}>
            Lance une analyse sur "Je cherche" et "Je suis" pour voir ton miroir.
          </p>
        </div>
      </div>
    )
  }

  const verdict  = getComparisonVerdict(searchResult.percentage, selfResult.percentage)
  const ratioStr = verdict.ratio > 100 ? `>${Math.round(verdict.ratio)}x` : `${verdict.ratio.toFixed(1)}x`
  const isHigh   = verdict.ratio > 5

  const verdictColor = verdict.ratio <= 0.5 ? '#a8d700'
    : verdict.ratio <= 1.5 ? '#C8FF00'
    : verdict.ratio <= 5   ? '#FFB800'
    : '#FF5C4D'

  const handleShare = async () => {
    setSharing(true)

    const text = [
      `📊 J'ai testé MiroirMiroir, l'app qui calcule ton ratio d'exigence en amour.`,
      '',
      phrase ? `J'hallucine, regarde ce qu'elle dit de moi : "${phrase}"` : '',
      '',
      `Ce que je cherche : ${formatPercentage(searchResult.percentage)}% de la population mondiale correspond à mes critères.`,
      `Ce que je suis : je représente moi-même ${formatPercentage(selfResult.percentage)}% de la population.`,
      `Mon ratio d'exigence : ${ratioStr} 👀`,
      '',
      `Autrement dit — je cherche quelqu'un ${ratioStr} plus rare que moi.`,
      '',
      `Teste toi-même et découvre ton ratio en téléchargeant l'appli ou sur le site 👇`,
      `mystandards.app`,
    ].filter(Boolean).join('\n')

    setSharing(false)

    if (navigator.share) {
      navigator.share({
        title: `Mon ratio d'exigence — MiroirStats`,
        text,
        url: 'https://mystandards.app',
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
        .then(() => alert('Copié dans le presse-papier !'))
        .catch(() => alert('Impossible de copier. Réessaie.'))
    }
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'32px', paddingBottom:'32px', animation:'fadeInUp 0.4s ease'}}>

      {/* Cartes côte à côte */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
        <div style={{background:'#17171F', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', padding:'16px'}}>
          <p style={{fontFamily:'DM Sans', fontSize:'11px', fontWeight:500, letterSpacing:'0.1em', color:'#a8d700', marginBottom:'6px', textTransform:'uppercase'}}>
            Ce que tu cherches
          </p>
          <p style={{fontFamily:'Syne', fontSize:'22px', fontWeight:800, color:'#C8FF00', letterSpacing:'-0.02em'}}>
            {formatPercentage(searchResult.percentage)}%
          </p>
          <p style={{fontFamily:'DM Sans', fontSize:'11px', color:'var(--outline)', marginTop:'4px'}}>
            {searchResult.count}
          </p>
        </div>
        <div style={{background:'#17171F', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', padding:'16px'}}>
          <p style={{fontFamily:'DM Sans', fontSize:'11px', fontWeight:500, letterSpacing:'0.1em', color:'rgba(116,209,255,0.7)', marginBottom:'6px', textTransform:'uppercase'}}>
            Ce que tu es
          </p>
          <p style={{fontFamily:'Syne', fontSize:'22px', fontWeight:800, color:'#74d1ff', letterSpacing:'-0.02em'}}>
            {formatPercentage(selfResult.percentage)}%
          </p>
          <p style={{fontFamily:'DM Sans', fontSize:'11px', color:'var(--outline)', marginTop:'4px'}}>
            {selfResult.count}
          </p>
        </div>
      </div>

      {/* Ratio d'exigence — XXL */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 0'}}>
        <p style={{fontFamily:'DM Sans', fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:'12px'}}>
          Ratio d'exigence
        </p>
        <div style={{position:'relative', display:'inline-block'}}>
          <h2 style={{
            fontFamily:'Syne', fontSize:'80px', fontWeight:800, lineHeight:1,
            color: verdictColor,
            filter:`drop-shadow(0 0 20px ${verdictColor}55)`,
            letterSpacing:'-0.04em'
          }}>
            {ratioStr}
          </h2>
          {isHigh && (
            <div style={{
              position:'absolute', top:'-8px', right:'-8px',
              background:`${verdictColor}1A`, border:`1px solid ${verdictColor}4D`,
              padding:'2px 8px', borderRadius:'4px',
              fontFamily:'DM Sans', fontSize:'10px', fontWeight:700,
              letterSpacing:'0.1em', color: verdictColor
            }}>
              CRITIQUE
            </div>
          )}
        </div>
      </div>

      {/* Barre visuelle */}
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <div style={{
          height:'6px', width:'100%', borderRadius:'999px',
          background:'linear-gradient(90deg, rgba(116,209,255,0.2) 0%, rgba(200,255,0,0.2) 100%)',
          position:'relative', overflow:'visible'
        }}>
          <div style={{
            position:'absolute', top:'50%', left:'5%', transform:'translateY(-50%)',
            width:'16px', height:'16px', borderRadius:'50%',
            background:'#74d1ff', border:'4px solid #0A0A0F',
            boxShadow:'0 2px 8px rgba(116,209,255,0.3)'
          }}/>
          <div style={{
            position:'absolute', top:'50%', right:'0', transform:'translateY(-50%)',
            width:'16px', height:'16px', borderRadius:'50%',
            background:'#C8FF00', border:'4px solid #0A0A0F',
            boxShadow:'0 0 12px rgba(200,255,0,0.5)'
          }}/>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', padding:'0 4px'}}>
          <span style={{fontFamily:'DM Sans', fontSize:'10px', fontWeight:500, letterSpacing:'0.1em', color:'rgba(116,209,255,0.6)', textTransform:'uppercase'}}>Toi (réel)</span>
          <span style={{fontFamily:'DM Sans', fontSize:'10px', fontWeight:500, letterSpacing:'0.1em', color:'rgba(200,255,0,0.6)', textTransform:'uppercase'}}>Cible (idéal)</span>
        </div>
      </div>

      {/* Carte verdict */}
      <div style={{
        background:'#17171F',
        border:'1px solid rgba(255,255,255,0.05)',
        borderLeft:`4px solid ${verdictColor}`,
        borderRadius:'0 12px 12px 0',
        padding:'20px'
      }}>
        <h3 style={{fontFamily:'Syne', fontSize:'18px', fontWeight:700, color:'var(--on-surface)', marginBottom:'8px'}}>
          {verdict.verdictTitle}
        </h3>
        <p style={{fontFamily:'DM Sans', fontSize:'16px', color:'var(--outline)', lineHeight:'1.6'}}>
          Tu cherches quelqu'un{' '}
          <span style={{color: verdictColor, fontWeight:700}}>{ratioStr} plus rare</span>
          {' '}que toi. {verdict.verdictDesc}
        </p>
      </div>

      {/* Phrase choc Claude */}
      {phrase ? (
        <div style={{
          textAlign: 'center',
          padding: '20px 24px',
          background: 'rgba(200,255,0,0.04)',
          border: '1px solid rgba(200,255,0,0.12)',
          borderRadius: '12px',
        }}>
          <p style={{
            fontFamily: 'Syne',
            fontSize: '16px',
            fontWeight: 700,
            color: '#C8FF00',
            lineHeight: '1.5',
            margin: 0,
            fontStyle: 'italic',
          }}>
            "{phrase}"
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px 24px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
        }}>
          <p style={{
            fontFamily: 'DM Sans',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.2)',
            margin: 0,
            fontStyle: 'italic',
          }}>
            ✦ Analyse en cours…
          </p>
        </div>
      )}

      {/* CTA Affiliation Dating */}
<div style={{
  padding: '20px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  marginBottom: '8px'
}}>
  <p style={{
    fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#8e9479', marginBottom: '8px', textAlign: 'center'
  }}>
    {verdict.ratio > 5
      ? 'Malgré ton ratio, prêt(e) à tenter ta chance ?'
      : 'Prêt(e) à rencontrer quelqu\'un qui te correspond ?'
    }
  </p>

  <div style={{ display: 'flex', gap: '12px' }}>
  
    href="https://tinder.com"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      flex: 1, height: '48px', borderRadius: '10px',
      background: 'linear-gradient(135deg, #FE3C72, #FF6B6B)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      textDecoration: 'none', transition: 'opacity 0.2s'
    }}
    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M8.5 3C8.5 3 9 7.5 6 10.5C3 13.5 2 17 2 17C2 17 3.5 14 7 13C7 13 5 16 5 19C5 21.5 7 23 9.5 23C13 23 16 20 16 16.5C16 14 14.5 12 14.5 12C14.5 12 15 14 13.5 15.5C13.5 15.5 14 13 13 11.5C12 10 12 8 12 8C12 8 11.5 10 10 11C10 11 11 7 8.5 3Z"/>
    </svg>
    <span style={{ fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 700, color: 'white' }}>
      Tinder
    </span>
  </a>

  
    href="https://bumble.com"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      flex: 1, height: '48px', borderRadius: '10px',
      background: 'linear-gradient(135deg, #FDA800, #FFCC00)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      textDecoration: 'none', transition: 'opacity 0.2s'
    }}
    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
    </svg>
    <span style={{ fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 700, color: '#7A5A00' }}>
      Bumble
    </span>
  </a>
</div>

      {/* Boutons */}
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <button
          onClick={handleShare}
          disabled={sharing}
          style={{
            width:'100%', height:'56px', borderRadius:'12px',
            background: sharing ? 'rgba(200,255,0,0.05)' : 'transparent',
            color:'var(--on-surface)',
            fontFamily:'DM Sans', fontSize:'12px', fontWeight:700,
            letterSpacing:'0.1em', textTransform:'uppercase',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'12px',
            border:'1px solid rgba(142,148,121,0.3)',
            cursor: sharing ? 'not-allowed' : 'pointer',
            transition:'background 0.2s',
            opacity: sharing ? 0.6 : 1,
          }}
          onMouseEnter={e => !sharing && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {sharing ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Préparation…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Partager mon résultat
            </>
          )}
        </button>

        <button
          onClick={onAdjust}
          style={{
            width:'100%', height:'56px', borderRadius:'12px',
            background:'transparent', color:'var(--on-surface)',
            fontFamily:'DM Sans', fontSize:'12px', fontWeight:700,
            letterSpacing:'0.1em', textTransform:'uppercase',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'12px',
            border:'1px solid rgba(142,148,121,0.3)',
            cursor:'pointer', transition:'background 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="10" cy="18" r="2" fill="currentColor"/>
          </svg>
          Ajuster mes critères
        </button>
      </div>

      {/* Footer */}
      <p style={{textAlign:'center', fontFamily:'DM Sans', fontSize:'10px', color:'var(--outline)', opacity:0.4, lineHeight:'1.6', paddingBottom:'16px'}}>
        Données basées sur les statistiques démographiques mondiales 2024.<br/>
        Analyse algorithmique MiroirStats v4.2.
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
