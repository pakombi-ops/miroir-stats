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