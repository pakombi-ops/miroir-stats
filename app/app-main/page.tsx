'use client'
import { useState, useCallback } from 'react'
import CriteriaPanel from '@/components/analysis/CriteriaPanel'
import ResultCard from '@/components/analysis/ResultCard'
import ComparePanel from '@/components/analysis/ComparePanel'
import CreditsBar from '@/components/ui/CreditsBar'
import { Criteria, AnalysisResult, getDefaultCriteria, getActiveCriteria } from '@/lib/types'
import { useRouter } from 'next/navigation'

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

  const handleCreditsLoaded = useCallback((balance: number, uid: string | null) => {
    setCredits(balance); setUserId(uid)
  }, [])

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

    if (credits !== null && credits <= 0 && userId) { router.push('/pricing'); return }

    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria, profileType: type, userId }),
      })
      if (res.status === 402) { router.push('/pricing'); return }
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setResult(data)
      if (credits !== null && userId) setCredits(c => Math.max(0, (c ?? 1) - 1))
      setView(prev => ({ ...prev, [type]: 'result' }))
    } catch { setError("Erreur lors de l'analyse. Réessaie.") }
    finally { setLoading(false) }
  }

  const searchActiveCount = getActiveCriteria(searchCriteria).length
  const selfActiveCount = getActiveCriteria(selfCriteria).length
  const isLoading = tab === 'search' ? loadingSearch : loadingSelf
  const currentView = tab === 'search' ? view.search : tab === 'self' ? view.self : 'criteria'

  const tabs: { id: Tab; label: string; accent: string }[] = [
    { id: 'search', label: 'Je cherche', accent: '#C8FF00' },
    { id: 'self', label: 'Je suis', accent: '#74d1ff' },
    { id: 'compare', label: 'Miroir', accent: '#e5e2dd' },
  ]

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="grain-overlay" />
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
          <div className="mx-5 mt-4 p-3 rounded-xl text-center" style={{ fontSize: '13px', background: 'rgba(255,92,77,0.1)', color: 'var(--error)', border: '1px solid rgba(255,92,77,0.2)' }}>
            {error}
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
              <CriteriaPanel criteria={searchCriteria} onChange={updateSearchCriteria} accentColor="lime" loading={loadingSearch} />
            )}

            {currentView === 'result' && (
              <ResultCard result={searchResult} loading={loadingSearch} accentColor="lime"
                label="CE QUE TU CHERCHES REPRÉSENTE"
                onNext={() => { setTab('self'); setView(p => ({ ...p, self: 'criteria' })) }}
                nextLabel="Analyser mon profil" />
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
              <CriteriaPanel criteria={selfCriteria} onChange={updateSelfCriteria} accentColor="blue" loading={loadingSelf} />
            )}

            {currentView === 'result' && (
              <ResultCard result={selfResult} loading={loadingSelf} accentColor="blue"
                label="TU REPRÉSENTES"
                onNext={() => setTab('compare')}
                nextLabel="Voir mon miroir" />
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
            <ComparePanel searchResult={searchResult} selfResult={selfResult} />
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