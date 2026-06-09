'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const FAQ = [
  {
    q: "Comment fonctionne le calcul ?",
    a: "MiroirStats utilise des données démographiques mondiales pour estimer le pourcentage de la population qui correspond à tes critères."
  },
  {
    q: "Mes crédits expirent-ils ?",
    a: "Non — tes crédits n'ont pas de date d'expiration. Tu peux les utiliser quand tu veux."
  },
  {
    q: "Les données sont-elles fiables ?",
    a: "Les estimations sont basées sur des données statistiques mondiales (OMS, Eurostat, recensements nationaux). Elles donnent un ordre de grandeur réaliste."
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Envoie un email à support@mystandards.app avec l'objet 'Suppression de compte' et ton adresse email de connexion."
  },
  {
    q: "Mes données sont-elles partagées ?",
    a: "Non. Tes critères et résultats restent privés et ne sont jamais partagés avec des tiers."
  },
]

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? null)
      const { data } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
      setBalance(data?.balance ?? 0)
    }
    load()
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '32px' }}>
      <p style={{
        fontFamily: 'DM Sans', fontSize: '11px', fontWeight: 500,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#8e9479', marginBottom: '12px'
      }}>
        {title}
      </p>
      <div style={{
        background: '#17171F', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', overflow: 'hidden'
      }}>
        {children}
      </div>
    </div>
  )

  const Row = ({ label, value, onPress, chevron }: { label: string; value?: string; onPress?: () => void; chevron?: boolean }) => (
    <button
      onClick={onPress}
      disabled={!onPress}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: onPress ? 'pointer' : 'default', textAlign: 'left'
      }}>
      <span style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#e5e2dd' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {value && <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#8e9479' }}>{value}</span>}
        {chevron && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e9479" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </div>
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingTop: '16px' }}>
        <button onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#8e9479', cursor: 'pointer', fontSize: '24px', padding: 0 }}>
          ‹
        </button>
        <h1 style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: 800, color: '#e5e2dd', margin: 0 }}>
          Mon compte
        </h1>
      </div>

      {/* Compte */}
      <Section title="Compte">
        <Row label="Email" value={email ?? '…'} />
        <Row label="Crédits restants" value={balance === null ? '…' : `${balance} crédits`} onPress={() => router.push('/pricing')} chevron />
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        {FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
              }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#e5e2dd', paddingRight: '16px' }}>
                {item.q}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e9479" strokeWidth="2" strokeLinecap="round"
                style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 16px 16px', fontFamily: 'DM Sans', fontSize: '14px', color: '#8e9479', lineHeight: '1.6' }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </Section>

      {/* Légal */}
      <Section title="Légal">
        <Row label="Mentions légales & CGU" onPress={() => window.open('https://www.mystandards.app/legal', '_blank')} chevron />
        <Row label="Politique de confidentialité" onPress={() => window.open('https://www.mystandards.app/privacy', '_blank')} chevron />
      </Section>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          width: '100%', height: '52px', borderRadius: '12px',
          background: 'rgba(255,92,77,0.08)', border: '1px solid rgba(255,92,77,0.2)',
          color: '#FF5C4D', fontFamily: 'DM Sans', fontSize: '15px', fontWeight: 600,
          cursor: 'pointer', marginBottom: '16px'
        }}>
        {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
      </button>

      <p style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: '11px', color: '#8e9479', opacity: 0.4 }}>
        MiroirStats v1.0 · mystandards.app
      </p>
    </div>
  )
}