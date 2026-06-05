'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const SLIDES = [
  {
    emoji: '🎁',
    title: '3 crédits offerts',
    subtitle: 'Bienvenue sur MiroirStats',
    description: 'Tu reçois 3 analyses gratuites pour découvrir l\'app. Chaque analyse consomme 1 crédit.',
    accent: '#C8FF00',
  },
  {
    emoji: '🔍',
    title: 'Comment ça marche',
    subtitle: '3 étapes simples',
    description: 'Définis ce que tu cherches → Décris qui tu es → Découvre ton ratio d\'exigence.',
    accent: '#C8FF00',
    steps: [
      { label: 'Je cherche', color: '#C8FF00', desc: 'Tes critères de sélection' },
      { label: 'Je suis', color: '#74d1ff', desc: 'Ton propre profil' },
      { label: 'Miroir', color: '#e5e2dd', desc: 'Ton ratio d\'exigence' },
    ]
  },
  {
    emoji: '⚖️',
    title: 'Le ratio d\'exigence',
    subtitle: 'La métrique qui fait mal',
    description: 'L\'écart entre ce que tu cherches et ce que tu représentes. Plus il est élevé, plus tes standards dépassent ta réalité.',
    accent: '#C8FF00',
    example: true,
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFinish = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles')
        .update({ onboarding_done: true })
        .eq('id', user.id)
    }
    router.replace('/app-main')
  }

  const handleNext = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1)
    else handleFinish()
  }

  const slide = SLIDES[current]

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      backgroundColor:'#0A0A0F', padding:'24px',
      position:'relative', overflow:'hidden'
    }}>

      {/* Glow */}
      <div style={{
        position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)',
        width:'400px', height:'400px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(200,255,0,0.08) 0%, transparent 70%)',
        pointerEvents:'none'
      }}/>

      {/* Skip */}
      {current < SLIDES.length - 1 && (
        <button onClick={handleFinish}
          style={{
            position:'absolute', top:'24px', right:'24px',
            background:'none', border:'none', cursor:'pointer',
            fontFamily:'DM Sans', fontSize:'13px', color:'#8e9479'
          }}>
          Passer
        </button>
      )}

      {/* Contenu */}
      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'32px'}}>

        {/* Emoji */}
        <div style={{
          width:'80px', height:'80px', borderRadius:'24px',
          background:'rgba(200,255,0,0.08)', border:'1px solid rgba(200,255,0,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'36px'
        }}>
          {slide.emoji}
        </div>

        {/* Texte */}
        <div style={{textAlign:'center', maxWidth:'320px'}}>
          <p style={{
            fontFamily:'DM Sans', fontSize:'12px', fontWeight:500,
            letterSpacing:'0.1em', color:'#8e9479', textTransform:'uppercase',
            marginBottom:'8px'
          }}>
            {slide.subtitle}
          </p>
          <h2 style={{
            fontFamily:'Syne', fontSize:'28px', fontWeight:800,
            color:'#e5e2dd', letterSpacing:'-0.02em', marginBottom:'16px'
          }}>
            {slide.title}
          </h2>
          <p style={{
            fontFamily:'DM Sans', fontSize:'15px', color:'#8e9479',
            lineHeight:'1.7'
          }}>
            {slide.description}
          </p>
        </div>

        {/* Slide 2 — Steps */}
        {slide.steps && (
          <div style={{width:'100%', maxWidth:'320px', display:'flex', flexDirection:'column', gap:'12px'}}>
            {slide.steps.map((step, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'16px',
                padding:'14px 16px', borderRadius:'12px',
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{
                  width:'32px', height:'32px', borderRadius:'50%',
                  background:`${step.color}15`, border:`1px solid ${step.color}40`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'Syne', fontSize:'12px', fontWeight:700, color: step.color,
                  flexShrink:0
                }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{fontFamily:'Syne', fontSize:'14px', fontWeight:700, color: step.color, margin:0}}>
                    {step.label}
                  </p>
                  <p style={{fontFamily:'DM Sans', fontSize:'12px', color:'#8e9479', margin:0}}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slide 3 — Exemple ratio */}
        {slide.example && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <div style={{
              padding:'20px', borderRadius:'16px',
              background:'rgba(255,184,0,0.05)', border:'1px solid rgba(255,184,0,0.2)'
            }}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
                <div style={{textAlign:'center'}}>
                  <p style={{fontFamily:'DM Sans', fontSize:'10px', color:'#a8d700', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px'}}>Tu cherches</p>
                  <p style={{fontFamily:'Syne', fontSize:'22px', fontWeight:800, color:'#C8FF00'}}>0.003%</p>
                </div>
                <div style={{textAlign:'center'}}>
                  <p style={{fontFamily:'DM Sans', fontSize:'10px', color:'rgba(116,209,255,0.7)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px'}}>Tu es</p>
                  <p style={{fontFamily:'Syne', fontSize:'22px', fontWeight:800, color:'#74d1ff'}}>0.08%</p>
                </div>
              </div>
              <div style={{textAlign:'center', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                <p style={{fontFamily:'DM Sans', fontSize:'11px', color:'#8e9479', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.1em'}}>Ratio d'exigence</p>
                <p style={{fontFamily:'Syne', fontSize:'40px', fontWeight:800, color:'#FFB800', filter:'drop-shadow(0 0 12px rgba(255,184,0,0.4))'}}>26x</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'24px', paddingBottom:'16px'}}>

        {/* Points */}
        <div style={{display:'flex', gap:'8px'}}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)}
              style={{
                width: i === current ? '24px' : '8px',
                height:'8px', borderRadius:'999px',
                background: i === current ? '#C8FF00' : 'rgba(255,255,255,0.15)',
                transition:'all 0.3s ease', cursor:'pointer'
              }}
            />
          ))}
        </div>

        {/* Bouton */}
        <button onClick={handleNext} disabled={loading}
          style={{
            width:'100%', maxWidth:'380px', height:'56px', borderRadius:'14px',
            background:'#C8FF00', color:'#161f00',
            fontFamily:'Syne', fontSize:'16px', fontWeight:700,
            border:'none', cursor:'pointer', transition:'all 0.2s'
          }}>
          {loading ? 'Chargement…' : current < SLIDES.length - 1 ? 'Suivant →' : 'Commencer mon analyse →'}
        </button>
      </div>
    </div>
  )
}