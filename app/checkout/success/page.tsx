'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CheckoutSuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); router.push('/app-main'); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-8"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Icône succès */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(200,255,0,0.1)', border: '2px solid rgba(200,255,0,0.3)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <div className="space-y-3">
        <h1 className="font-display font-bold text-3xl">Crédits ajoutés !</h1>
        <p className="text-base font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Tes crédits ont été ajoutés à ton compte.<br />
          Tu peux maintenant continuer tes analyses.
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => router.push('/app-main')}
          className="w-full py-4 rounded-2xl font-display font-bold text-base tracking-wide transition-all active:scale-95"
          style={{ background: '#C8FF00', color: '#0A0A0F' }}>
          Retour à l'app →
        </button>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Redirection automatique dans {countdown}s
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-primary)' }} />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
