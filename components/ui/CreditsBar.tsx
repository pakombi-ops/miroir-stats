'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreditsBarProps {
  onCreditsLoaded?: (balance: number, userId: string | null) => void
}

export default function CreditsBar({ onCreditsLoaded }: CreditsBarProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.json())
      .then(data => {
        const bal = data.authenticated ? (data.balance ?? 0) : 999
        setBalance(bal)
        setAuthenticated(data.authenticated ?? false)
        onCreditsLoaded?.(bal, data.userId ?? null)
      })
      .catch(() => { setBalance(999); onCreditsLoaded?.(999, null) })
  }, [])

  return (
    <div className="flex items-center justify-between px-5 py-3"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8FF00', animation: 'pulseDot 2s infinite' }} />
        <span className="font-display font-bold text-lg tracking-tight">MIROIR</span>
      </div>
      <button
        onClick={() => router.push('/pricing')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
        {!authenticated
          ? <span style={{ color: '#C8FF00' }}>Mode test</span>
          : <span style={{ color: '#C8FF00' }}>{balance === null ? '…' : `${balance} crédits`}</span>
        }
      </button>
    </div>
  )
}