'use client'
import { Criteria, getDefaultCriteria } from '@/lib/types'

interface Props {
  criteria: Criteria
  onChange: (id: keyof Criteria, value: any) => void
  accentColor: 'lime' | 'blue'
  loading?: boolean
  mode?: 'search' | 'self'
}

function ToggleGroup({ options, value, onChange, accent }: { options: string[]; value: string; onChange: (v: string) => void; accent: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          style={{
            padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
            fontWeight: value === opt ? 500 : 400, cursor: 'pointer', transition: 'all 0.15s',
            background: value === opt ? accent : 'rgba(255,255,255,0.05)',
            color: value === opt ? '#000' : 'var(--on-surface-variant)',
            border: value === opt ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.1)',
          }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function SliderField({ label, value, min, max, step, onChange, format, accent }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string; accent: string
}) {
  return (
    <div style={{ marginTop: '10px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: accent }}>{format(value)}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: accent, height: '4px', cursor: 'pointer' }} />
    </div>
  )
}

function MiniToggle({ options, value, onChange, accent }: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void; accent: string }) {
  return (
    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            background: value === opt.value ? accent : 'transparent',
            color: value === opt.value ? '#000' : 'var(--outline)',
            border: 'none', fontWeight: 500,
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Card({ label, isActive, accent, children }: { label: string; isActive: boolean; accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: isActive ? `${accent}08` : 'var(--bg-container)',
      border: `1px solid ${isActive ? accent + '44' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '14px', padding: '16px', marginBottom: '12px',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? accent : 'var(--outline)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

const CHEVEUX = ['Toutes', 'Noirs', 'Bruns', 'Châtains', 'Blonds', 'Roux', 'Blancs / Gris', 'Autre']
const CHEVEUX_SELF = ['Noirs', 'Bruns', 'Châtains', 'Blonds', 'Roux', 'Blancs / Gris', 'Autre']

const YEUX = ['Toutes', 'Noirs', 'Marron', 'Noisette', 'Verts', 'Bleus', 'Gris', 'Autre']
const YEUX_SELF = ['Noirs', 'Marron', 'Noisette', 'Verts', 'Bleus', 'Gris', 'Autre']
const RELIGIONS = ['Toutes', 'Athée / Agnostique', 'Chrétienne', 'Musulmane', 'Juive', 'Hindoue', 'Bouddhiste', 'Autre']
const RELIGIONS_SELF = ['Athée / Agnostique', 'Chrétienne', 'Musulmane', 'Juive', 'Hindoue', 'Bouddhiste', 'Autre']

export default function CriteriaPanel({ criteria, onChange, accentColor, loading, mode = 'search' }: Props) {
  const def = getDefaultCriteria()
  const accent = accentColor === 'lime' ? '#C8FF00' : '#74d1ff'
  const set = (key: keyof Criteria, value: any) => onChange(key, value)

  const revenuMax = criteria.revenuType === 'mensuel' ? 20000 : 240000
  const revenuStep = criteria.revenuType === 'mensuel' ? 500 : 6000

  const formatRevenu = (v: number) => {
    if (v === 0) return mode === 'self' ? '0 €' : 'Aucun minimum'
    return `${v.toLocaleString()} € / ${criteria.revenuType === 'mensuel' ? 'mois' : 'an'}`
  }

  const formatTaille = (v: number) => {
    if (v === 0) return mode === 'self' ? '0 cm' : 'Aucun minimum'
    if (criteria.tailleUnit === 'cm') return `${v} cm`
    const feet = Math.floor(v / 30.48)
    const inches = Math.round((v / 30.48 - feet) * 12)
    return `${feet}'${inches}"`
  }

  return (
    <div style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>

      {/* Genre */}
      <Card label="Genre" isActive={criteria.genre !== def.genre} accent={accent}>
        <ToggleGroup
          options={mode === 'self' ? ['Femme', 'Homme', 'Non-binaire'] : ['Tous', 'Femme', 'Homme', 'Non-binaire']}
          value={criteria.genre}
          onChange={v => set('genre', v)}
          accent={accent}
        />
      </Card>

      {/* Âge */}
      {mode === 'search' ? (
        <Card label="Tranche d'âge" isActive={criteria.ageMin !== def.ageMin || criteria.ageMax !== def.ageMax} accent={accent}>
          <div style={{ fontSize: '20px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--on-surface)', marginTop: '8px' }}>
            {criteria.ageMin} – {criteria.ageMax} ans
          </div>
          <SliderField label="Âge minimum" value={criteria.ageMin} min={18} max={criteria.ageMax - 1} step={1}
            onChange={v => set('ageMin', v)} format={v => `${v} ans`} accent={accent} />
          <SliderField label="Âge maximum" value={criteria.ageMax} min={criteria.ageMin + 1} max={80} step={1}
            onChange={v => set('ageMax', v)} format={v => `${v} ans`} accent={accent} />
        </Card>
      ) : (
        <Card label="Âge" isActive={criteria.age !== def.age} accent={accent}>
          <div style={{ fontSize: '28px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: accent, marginTop: '8px' }}>
            {criteria.age} ans
          </div>
          <SliderField label="" value={criteria.age} min={18} max={80} step={1}
            onChange={v => set('age', v)} format={v => `${v} ans`} accent={accent} />
        </Card>
      )}

      {/* Revenu */}
      {mode === 'search' ? (
        <Card label="Revenu minimum" isActive={criteria.revenuMin > 0} accent={accent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--on-surface)' }}>
              {formatRevenu(criteria.revenuMin)}
            </span>
            <MiniToggle
              options={[{ label: '/mois', value: 'mensuel' }, { label: '/an', value: 'annuel' }]}
              value={criteria.revenuType}
              onChange={v => set('revenuType', v)}
              accent={accent}
            />
          </div>
          <SliderField label="" value={Math.min(criteria.revenuMin, revenuMax)} min={0} max={revenuMax} step={revenuStep}
            onChange={v => set('revenuMin', v)} format={formatRevenu} accent={accent} />
        </Card>
      ) : (
        <Card label="Revenu" isActive={criteria.revenu > 0} accent={accent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: accent }}>
              {formatRevenu(criteria.revenu)}
            </span>
            <MiniToggle
              options={[{ label: '/mois', value: 'mensuel' }, { label: '/an', value: 'annuel' }]}
              value={criteria.revenuType}
              onChange={v => set('revenuType', v)}
              accent={accent}
            />
          </div>
          <SliderField label="" value={Math.min(criteria.revenu, revenuMax)} min={0} max={revenuMax} step={revenuStep}
            onChange={v => set('revenu', v)} format={formatRevenu} accent={accent} />
        </Card>
      )}

      {/* Zone */}
      <Card label="Zone géographique" isActive={criteria.zone !== def.zone} accent={accent}>
        <ToggleGroup
          options={mode === 'self' ? ['France', 'Europe', 'Amérique du Nord', 'Asie', 'Afrique'] : ['Monde entier', 'France', 'Europe', 'Amérique du Nord', 'Asie', 'Afrique']}
          value={criteria.zone}
          onChange={v => set('zone', v)}
          accent={accent}
        />
      </Card>

      {/* Ethnie */}
      <Card label="Origine ethnique" isActive={criteria.ethnie !== def.ethnie} accent={accent}>
        <ToggleGroup
          options={mode === 'self' ? ['Blanche', 'Noire', 'Asiatique', 'Latino', 'Arabe', 'Métissée'] : ['Toutes', 'Blanche', 'Noire', 'Asiatique', 'Latino', 'Arabe', 'Métissée']}
          value={criteria.ethnie}
          onChange={v => set('ethnie', v)}
          accent={accent}
        />
      </Card>

      {/* Religion */}
      <Card label="Religion" isActive={criteria.religion !== def.religion} accent={accent}>
        <ToggleGroup
          options={mode === 'self' ? RELIGIONS_SELF : RELIGIONS}
          value={criteria.religion}
          onChange={v => set('religion', v)}
          accent={accent}
        />
      </Card>

      {/* Marital — seulement en mode search */}
      {mode === 'search' && (
        <Card label="Déjà marié(e)" isActive={criteria.dejaMarie !== def.dejaMarie} accent={accent}>
          <ToggleGroup
            options={['Peu importe', 'Jamais marié(e)', 'Divorcé(e)', 'Veuf/Veuve']}
            value={criteria.dejaMarie}
            onChange={v => set('dejaMarie', v)}
            accent={accent}
          />
        </Card>
      )}

      {/* Taille */}
      {mode === 'search' ? (
        <Card label="Taille minimum" isActive={criteria.tailleMin > 0} accent={accent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--on-surface)' }}>
              {formatTaille(criteria.tailleMin)}
            </span>
            <MiniToggle
              options={[{ label: 'cm', value: 'cm' }, { label: 'pieds', value: 'pieds' }]}
              value={criteria.tailleUnit}
              onChange={v => set('tailleUnit', v)}
              accent={accent}
            />
          </div>
          <SliderField label="" value={criteria.tailleMin} min={0} max={220} step={1}
            onChange={v => set('tailleMin', v)} format={formatTaille} accent={accent} />
        </Card>
      ) : (
        <Card label="Taille" isActive={criteria.taille !== def.taille} accent={accent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '28px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: accent }}>
              {formatTaille(criteria.taille)}
            </span>
            <MiniToggle
              options={[{ label: 'cm', value: 'cm' }, { label: 'pieds', value: 'pieds' }]}
              value={criteria.tailleUnit}
              onChange={v => set('tailleUnit', v)}
              accent={accent}
            />
          </div>
          <SliderField label="" value={criteria.taille} min={140} max={220} step={1}
            onChange={v => set('taille', v)} format={formatTaille} accent={accent} />
        </Card>
      )}

      {/* Enfants */}
      <Card label="Enfant(s)" isActive={criteria.enfants !== def.enfants} accent={accent}>
        <ToggleGroup
          options={mode === 'search' ? ['Peu importe', 'Sans enfants', 'Avec enfants'] : ['Non', 'Oui']}
          value={criteria.enfants}
          onChange={v => set('enfants', v)}
          accent={accent}
        />
      </Card>

      {/* Cheveux */}
    <Card label="Couleur des cheveux" isActive={criteria.cheveuxCouleur !== def.cheveuxCouleur} accent={accent}>
      <ToggleGroup
       options={mode === 'self' ? CHEVEUX_SELF : CHEVEUX}
       value={criteria.cheveuxCouleur}
        onChange={v => set('cheveuxCouleur', v)}
        accent={accent}
      />
    </Card>

    {/* Yeux */}
  <Card label="Couleur des yeux" isActive={criteria.yeuxCouleur !== def.yeuxCouleur} accent={accent}>
    <ToggleGroup
    options={mode === 'self' ? YEUX_SELF : YEUX}
    value={criteria.yeuxCouleur}
    onChange={v => set('yeuxCouleur', v)}
    accent={accent}
  />
  </Card>

      {/* Obésité */}
      <Card label="En obésité" isActive={criteria.obesite !== def.obesite} accent={accent}>
        <ToggleGroup
          options={mode === 'self' ? ['Non', 'Oui'] : ['Peu importe', 'Non', 'Oui']}
          value={criteria.obesite}
          onChange={v => set('obesite', v)}
          accent={accent}
        />
      </Card>

    </div>
  )
}