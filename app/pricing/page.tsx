'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CREDIT_PACKS, PackId } from '@/lib/stripe/config'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packId: PackId, recipientEmail?: string) => {
    setLoading(packId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, recipientEmail }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (e) {
      alert('Erreur lors du paiement. Réessaie.')
    } finally {
      setLoading(null)
    }
  }

  const packs = Object.values(CREDIT_PACKS)

  return (
    <div className="min-h-screen px-5 py-8 space-y-6" style={{ background: 'var(--bg-primary)', maxWidth: '430px', margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1 className="font-display font-bold text-xl">Recharger mes crédits</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Achat unique · Sans abonnement · Sans expiration</p>
        </div>
      </div>

      {/* Rappel logique crédits */}
      <div className="card-surface p-4 space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Comment ça fonctionne</p>
        <div className="space-y-1.5">
          {[
            ['1 crédit', 'Par analyse (cherche ou soi)'],
            ['0 crédit', 'Capture email → résultat complet'],
            ['Gratuit', '3 crédits offerts à l\'inscription'],
          ].map(([credit, desc]) => (
            <div key={credit} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(200,255,0,0.08)', color: '#C8FF00', border: '1px solid rgba(200,255,0,0.15)' }}>
                {credit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Packs */}
      <div className="space-y-3">
        {packs.map((pack) => {
          const isPopular = pack.popular
          const isGift = 'isGift' in pack && pack.isGift
          const isLoading = loading === pack.id

          return (
            <div
              key={pack.id}
              className="card p-5 space-y-4 transition-all"
              style={isPopular ? { borderColor: 'rgba(200,255,0,0.3)', background: 'rgba(200,255,0,0.03)' } : {}}>

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-base">{pack.name}</p>
                    {isPopular && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(200,255,0,0.12)', color: '#C8FF00', border: '1px solid rgba(200,255,0,0.25)' }}>
                        Populaire
                      </span>
                    )}
                    {isGift && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(96,205,255,0.1)', color: '#60CDFF', border: '1px solid rgba(96,205,255,0.2)' }}>
                        Cadeau viral
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>{pack.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-2xl" style={{ color: isGift ? '#60CDFF' : '#C8FF00' }}>
                    {pack.priceDisplay}
                  </p>
                  {!isGift && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {pack.credits} crédits
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handlePurchase(pack.id as PackId)}
                disabled={!!loading}
                className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50"
                style={isPopular
                  ? { background: '#C8FF00', color: '#0A0A0F' }
                  : { border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--bg-surface)' }
                }>
                {isLoading ? 'Redirection…' : isGift ? 'Offrir un accès →' : `Acheter ${pack.credits} crédits →`}
              </button>
            </div>
          )
        })}
      </div>

      {/* PDF one-shot */}
      <div className="card p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium">Export PDF</p>
            <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>
              Ton rapport complet en PDF — sans crédit supplémentaire
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-2xl" style={{ color: '#4ade80' }}>0,99 €</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>one-shot</p>
          </div>
        </div>
        <button
          className="w-full py-3.5 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', background: 'rgba(74,222,128,0.05)' }}>
          Exporter mon rapport →
        </button>
      </div>

      <p className="text-center text-xs pb-8" style={{ color: 'var(--text-muted)' }}>
        Paiement sécurisé par Stripe · TVA incluse
      </p>
    </div>
  )
}
