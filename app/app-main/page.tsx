'use client'
import { useState, useCallback, useEffect } from 'react'
import CriteriaPanel from '@/components/analysis/CriteriaPanel'
import ResultCard from '@/components/analysis/ResultCard'
import ComparePanel from '@/components/analysis/ComparePanel'
import CreditsBar from '@/components/ui/CreditsBar'
import { Criteria, AnalysisResult, getDefaultCriteria, getActiveCriteria, getComparisonVerdict } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type Tab = 'search' | 'self' | 'compare'
type View = 'criteria' | 'result'

export default function AppMain() {
  const router = useRouter()
  const [searchCriteria, setSearchCriteria] = useState<Criteria>(getDefaultCriteria())
  const [selfCriteria, setSelfCriteria] = useState<Criteria>(getDefaultCriteria())
  const [searchResult, setSearchResult] = useState<AnalysisResult | null>(null)
  const [selfResult, setSelfResult] = useState<AnalysisResult | null>(null)
  const [tab, setTab] = useState<Tab>('search')
  const [view, setView] = useState<{ search: View; self: View }>({ search: 'criteria', self: 'criteria' })
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingSelf, setLoadingSelf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [viralPhrase, setViralPhrase] = useState('')
  const [loadingPhrase, setLoadingPhrase] = useState('')
  const [loadingTab, setLoadingTab] = useState<Tab>('search')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleCreditsLoaded = useCallback((balance: number, uid: string | null) => {
    setCredits(balance); setUserId(uid)
  }, [])

  const generateViralPhrase = async (search: AnalysisResult, self: AnalysisResult) => {
    const verdict = getComparisonVerdict(search.percentage, self.percentage)
    try {
      const res = await fetch('/api/share-card/phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ratio:     verdict.ratio,
          searchPct: search.percentage,
          selfPct:   self.percentage,
        }),
      })
      const data = await res.json()
      if (data.phrase) setViralPhrase(data.phrase)
    } catch { /* silencieux */ }
  }

  const updateSearchCriteria = (id: keyof Criteria, value: any) => {
    setSearchCriteria(p => ({ ...p, [id]: value }))
  }

  const updateSelfCriteria = (id: keyof Criteria, value: any) => {
    setSelfCriteria(p => ({ ...p, [id]: value }))
  }

  const runAnalysis = async (type: 'search' | 'self') => {
    const criteria = type === 'search' ? searchCriteria : selfCriteria
    const setLoading = type === 'search' ? setLoadingSearch : setLoadingSelf
    const setResult = type === 'search' ? setSearchResult : setSelfResult

    if (credits !== null && credits <= 0 && userId) {
      setError('Tes crédits sont épuisés. Achète un pack pour continuer tes analyses.')
      setTimeout(() => router.push('/pricing'), 2500)
      return
    }

    // Phrases dramatiques selon le type d'analyse
    const dramaticPhrases = type === 'search'
      ? [
          'Comparaison avec 8 milliards de personnes…',
          'Calcul de la rareté de ton idéal…',
          'Analyse des critères en cours…',
          'Résultat presque prêt…',
        ]
      : [
          'Comparaison avec 8 milliards de personnes…',
          'Calcul de ta rareté démographique…',
          'Analyse de ton profil en cours…',
          'Résultat presque prêt…',
        ]

    let phraseIndex = 0
    setLoadingPhrase(dramaticPhrases[0])
    setLoadingTab(type)
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % dramaticPhrases.length
      setLoadingPhrase(dramaticPhrases[phraseIndex])
    }, 900)

    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria, profileType: type, userId }),
      })
      if (res.status === 402) {
        setError('Tes crédits sont épuisés. Achète un pack pour continuer tes analyses.')
        setTimeout(() => router.push('/pricing'), 2500)
        return
      }

      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setResult(data)

      if (type === 'self' && searchResult) {
        generateViralPhrase(searchResult, data)
      }

      if (credits !== null && userId) setCredits(c => Math.max(0, (c ?? 1) - 1))
      setView(prev => ({ ...prev, [type]: 'result' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch { setError("Erreur lors de l'analyse. Réessaie.") }
    finally {
      clearInterval(phraseInterval)
      setLoading(false)
      setLoadingPhrase('')
    }
  }

  const searchActiveCount = getActiveCriteria(searchCriteria).length
  const selfActiveCount = getActiveCriteria(selfCriteria).length
  const isLoading = tab === 'search' ? loadingSearch : loadingSelf
  const currentView = tab === 'search' ? view.search : tab === 'self' ? view.self : 'criteria'
  const isAnyLoading = loadingSearch || loadingSelf
  const accentColor = loadingTab === 'search' ? '#C8FF00' : '#74d1ff'
  const accentRgb = loadingTab === 'search' ? '200,255,0' : '116,209,255'

  const tabs: { id: Tab; label: string; accent: string }[] = [
    { id: 'search', label: 'Je cherche', accent: '#C8FF00' },
    { id: 'self', label: 'Je suis', accent: '#74d1ff' },
    { id: 'compare', label: 'Miroir', accent: '#e5e2dd' },
  ]

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="grain-overlay" />

      {/* OVERLAY LOADING DRAMATIQUE */}
      {isAnyLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(13,14,11,0.97)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '36px',
        }}>
          {/* Orbe animé */}
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            {/* Halo externe */}
            <div style={{
              position: 'absolute', inset: '-10px', borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${accentRgb},0.15) 0%, transparent 70%)`,
              animation: 'miroir-pulse 2s ease-in-out infinite',
            }} />
            {/* Anneau rotatif */}
            <div style={{
              position: 'absolute', inset: '10px', borderRadius: '50%',
              border: `1.5px solid rgba(${accentRgb},0.4)`,
              animation: 'miroir-spin 4s linear infinite',
            }} />
            {/* Anneau rotatif inverse */}
            <div style={{
              position: 'absolute', inset: '22px', borderRadius: '50%',
              border: `1.5px solid rgba(${accentRgb},0.2)`,
              animation: 'miroir-spin-reverse 3s linear infinite',
            }} />
            {/* Point central */}
            <div style={{
              position: 'absolute', inset: '38px', borderRadius: '50%',
              background: accentColor,
              animation: 'miroir-pulse 1.5s ease-in-out infinite',
              boxShadow: `0 0 20px rgba(${accentRgb},0.6)`,
            }} />
          </div>

          {/* Chiffre 8B */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '80px',
              fontWeight: 800,
              color: accentColor,
              lineHeight: 1,
              letterSpacing: '-3px',
              animation: 'miroir-pulse 2s ease-in-out infinite',
              textShadow: `0 0 40px rgba(${accentRgb},0.4)`,
            }}>
              8B
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: '6px',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              personnes analysées
            </div>
          </div>

          {/* Phrase dynamique */}
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'DM Sans, sans-serif',
            textAlign: 'center',
            padding: '0 48px',
            minHeight: '22px',
            letterSpacing: '0.01em',
          }}>
            {loadingPhrase}
          </div>

          {/* Barre de progression */}
          <div style={{
            width: '120px', height: '2px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: accentColor,
              borderRadius: '2px',
              animation: 'miroir-progress 3.6s ease-in-out infinite',
            }} />
          </div>
        </div>
      )}

      <CreditsBar onCreditsLoaded={handleCreditsLoaded} />

      {/* Tabs */}
      <div style={{
        position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 40,
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(19,20,17,0.95)', backdropFilter: 'blur(12px)'
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none',
              background: 'transparent', transition: 'all 0.2s',
              color: tab === t.id ? t.accent : 'var(--outline)',
              borderBottom: tab === t.id ? `2px solid ${t.accent}` : '2px solid transparent',
            }}>
            {t.label}
            {t.id === 'search' && searchResult && ' ✓'}
            {t.id === 'self' && selfResult && ' ✓'}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto relative z-10" style={{ paddingTop: '112px', paddingBottom: '96px' }}>

        {error && (
          <div className="mx-5 mt-4 p-4 rounded-xl text-center" style={{
            background: error.includes('épuisés') ? 'rgba(200,255,0,0.08)' : 'rgba(255,92,77,0.1)',
            color: error.includes('épuisés') ? '#C8FF00' : 'var(--error)',
            border: `1px solid ${error.includes('épuisés') ? 'rgba(200,255,0,0.3)' : 'rgba(255,92,77,0.2)'}`,
            fontSize: '14px', fontFamily: 'DM Sans'
          }}>
            {error.includes('épuisés') && (
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✦</div>
            )}
            {error}
            {error.includes('épuisés') && (
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '6px' }}>
                Redirection dans 3 secondes…
              </div>
            )}
          </div>
        )}

        {/* TAB: Je cherche */}
        {tab === 'search' && (
          <div className="px-5 pt-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              {currentView === 'result' ? (
                <button onClick={() => setView(p => ({ ...p, search: 'criteria' }))}
                  style={{ color: '#C8FF00', fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ‹
                </button>
              ) : (
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: '#C8FF00' }}>
                  Ce que je cherche
                </h1>
              )}
              {searchActiveCount > 0 && currentView === 'criteria' && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(200,255,0,0.15)', border: '1px solid rgba(200,255,0,0.3)', color: '#C8FF00' }}>
                  {searchActiveCount} actif{searchActiveCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {currentView === 'criteria' && (
              <CriteriaPanel criteria={searchCriteria} onChange={updateSearchCriteria} accentColor="lime" loading={loadingSearch} mode="search"/>
            )}

            {currentView === 'result' && (
              <ResultCard result={searchResult} loading={loadingSearch} accentColor="lime"
                label="CE QUE TU CHERCHES REPRÉSENTE"
                zone={searchCriteria.zone}
                onNext={() => {
                  setTab('self')
                  setView(p => ({ ...p, self: 'criteria' }))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                nextLabel="Analyser mon profil"
                onModify={() => {
                  setView(p => ({ ...p, search: 'criteria' }))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </div>
        )}

        {/* TAB: Je suis */}
        {tab === 'self' && (
          <div className="px-5 pt-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              {currentView === 'result' ? (
                <button onClick={() => setView(p => ({ ...p, self: 'criteria' }))}
                  style={{ color: '#74d1ff', fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ‹
                </button>
              ) : (
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: '#74d1ff' }}>
                  Ce que je suis
                </h1>
              )}
              {selfActiveCount > 0 && currentView === 'criteria' && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(116,209,255,0.15)', border: '1px solid rgba(116,209,255,0.3)', color: '#74d1ff' }}>
                  {selfActiveCount} actif{selfActiveCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {currentView === 'criteria' && (
              <CriteriaPanel criteria={selfCriteria} onChange={updateSelfCriteria} accentColor="blue" loading={loadingSelf} mode="self"/>
            )}

            {currentView === 'result' && (
              <ResultCard result={selfResult} loading={loadingSelf} accentColor="blue"
                label="TU REPRÉSENTES"
                zone={selfCriteria.zone}
                onNext={() => {
                  setTab('compare')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                nextLabel="Voir mon miroir"
                onModify={() => {
                  setView(p => ({ ...p, self: 'criteria' }))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </div>
        )}

        {/* TAB: Miroir */}
        {tab === 'compare' && (
          <div className="px-5 pt-4">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: '#C8FF00' }}>MIROIR</h1>
              <p style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ton analyse complète</p>
            </div>
            <ComparePanel
              searchResult={searchResult}
              selfResult={selfResult}
              viralPhrase={viralPhrase}
              userId={userId ?? undefined}
              onAdjust={() => { setTab('search'); setView(p => ({ ...p, search: 'criteria' })) }}
            />
          </div>
        )}
      </div>

      {/* CTA fixe */}
      {tab !== 'compare' && currentView === 'criteria' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          padding: '0 20px 24px',
          background: 'linear-gradient(to top, var(--bg) 70%, transparent)'
        }}>
          <button
            onClick={() => runAnalysis(tab as 'search' | 'self')}
            disabled={isLoading}
            style={{
              width: '100%', height: '56px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700,
              background: tab === 'search' ? '#C8FF00' : '#74d1ff',
              color: tab === 'search' ? '#161f00' : '#003548',
              opacity: isLoading ? 0.5 : 1, transition: 'all 0.2s',
            }}>
            {isLoading ? 'Analyse en cours…' : tab === 'search' ? 'Analyser →' : 'Calculer mon profil →'}
          </button>
        </div>
      )}
    </div>
  )
}
