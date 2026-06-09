'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface CreditsBarProps {
  onCreditsLoaded?: (balance: number, userId: string | null) => void
}

export default function CreditsBar({ onCreditsLoaded }: CreditsBarProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const loadCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setBalance(0)
        setAuthenticated(false)
        onCreditsLoaded?.(0, null)
        return
      }
      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      const bal = data?.balance ?? 0
      setBalance(bal)
      setAuthenticated(true)
      onCreditsLoaded?.(bal, user.id)
    }

    loadCredits()
  }, [])

  return (
    <div className="flex items-center justify-between px-5 py-3"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8FF00', animation: 'pulseDot 2s infinite' }} />
        <span className="font-display font-bold text-lg tracking-tight">MIROIR</span>
      </div>

      {/* Droite : crédits + bouton info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
          {!authenticated
            ? <span style={{ color: '#C8FF00' }}>Mode test</span>
            : <span style={{ color: '#C8FF00' }}>{balance === null ? '…' : `${balance} crédits`}</span>
          }
        </button>

        {/* Bouton ⓘ */}
        <button
          onClick={() => router.push('/profile')}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#8e9479'
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5"/>
            <line x1="12" y1="11" x2="12" y2="16"/>
          </svg>
        </button>
      </div>
    </div>
  )
}