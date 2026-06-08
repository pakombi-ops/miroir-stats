'use client'

import { useState, useRef, useEffect } from 'react'

interface ShareCardModalProps {
  ratio: number
  searchPct: number
  selfPct: number
  onClose: () => void
}

type Format = 'square' | 'vertical'
type Theme = 'dark' | 'light'

export default function ShareCardModal({
  ratio,
  searchPct,
  selfPct,
  onClose,
}: ShareCardModalProps) {
  const [phrase, setPhrase] = useState('')
  const [loadingPhrase, setLoadingPhrase] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  const [format, setFormat] = useState<Format>('square')
  const [theme, setTheme] = useState<Theme>('dark')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Génère la préview client-side avec Canvas API
  useEffect(() => {
    drawPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase, theme, format])

  function drawPreview() {
    const canvas = canvasRef.current
    if (!canvas) return

    const isSquare = format === 'square'
    const W = 320
    const H = isSquare ? 320 : 568
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')!
    const T = theme === 'dark'
      ? { bg: '#0A0A0F', accent: '#C8FF00', text: '#fff', sub: 'rgba(255,255,255,0.45)', divider: 'rgba(255,255,255,0.12)' }
      : { bg: '#F5F5F0', accent: '#0A0A0F', text: '#0A0A0F', sub: 'rgba(0,0,0,0.45)', divider: 'rgba(0,0,0,0.12)' }

    const s = W / 1080

    ctx.fillStyle = T.bg
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
    ctx.lineWidth = 1
    for (let i = 0; i < W; i += Math.round(80 * s)) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke()
    }

    // Top bar
    ctx.fillStyle = T.accent
    ctx.fillRect(0, 0, W, Math.round(6 * s))

    // Logo
    ctx.font = `bold ${Math.round(24 * s)}px system-ui`
    ctx.fillStyle = T.sub
    ctx.textAlign = 'left'
    ctx.fillText('MIROIR STATS', Math.round(60 * s), Math.round(80 * s))

    // Domain
    ctx.font = `${Math.round(22 * s)}px system-ui`
    ctx.fillStyle = T.sub
    ctx.textAlign = 'right'
    ctx.fillText('mystandards.app', W - Math.round(60 * s), Math.round(80 * s))

    // Ratio
    const ratioY = Math.round(H * (isSquare ? 0.42 : 0.35))
    ctx.textAlign = 'center'
    ctx.font = `bold ${Math.round(220 * s)}px system-ui`
    ctx.fillStyle = T.accent
    ctx.fillText(`${ratio}×`, W / 2, ratioY)

    ctx.font = `${Math.round(24 * s)}px system-ui`
    ctx.fillStyle = T.sub
    ctx.fillText("RATIO D'EXIGENCE", W / 2, ratioY + Math.round(44 * s))

    // Stats
    const statsY = Math.round(H * (isSquare ? 0.60 : 0.50))
    const col1 = Math.round(W * 0.3)
    const col2 = Math.round(W * 0.7)

    ctx.strokeStyle = T.divider
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2, statsY - Math.round(28 * s))
    ctx.lineTo(W / 2, statsY + Math.round(52 * s))
    ctx.stroke()

    ctx.font = `bold ${Math.round(52 * s)}px system-ui`
    ctx.fillStyle = T.text
    ctx.textAlign = 'center'
    ctx.fillText(`${searchPct}%`, col1, statsY + Math.round(8 * s))
    ctx.font = `${Math.round(20 * s)}px system-ui`
    ctx.fillStyle = T.sub
    ctx.fillText('JE CHERCHE', col1, statsY + Math.round(36 * s))

    ctx.font = `bold ${Math.round(52 * s)}px system-ui`
    ctx.fillStyle = T.text
    ctx.fillText(`${selfPct}%`, col2, statsY + Math.round(8 * s))
    ctx.font = `${Math.round(20 * s)}px system-ui`
    ctx.fillStyle = T.sub
    ctx.fillText('JE SUIS', col2, statsY + Math.round(36 * s))

    // Phrase
    if (phrase) {
      const phraseY = Math.round(H * (isSquare ? 0.75 : 0.65))
      ctx.font = `${Math.round(28 * s)}px system-ui`
      ctx.fillStyle = T.text
      ctx.textAlign = 'center'
      const words = `"${phrase}"`.split(' ')
      let line = ''
      let y = phraseY
      const maxW = W - Math.round(80 * s)
      const lh = Math.round(40 * s)
      for (const word of words) {
        const test = line + word + ' '
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line.trim(), W / 2, y)
          line = word + ' '
          y += lh
        } else { line = test }
      }
      ctx.fillText(line.trim(), W / 2, y)
    }

    // Watermark
    ctx.font = `bold ${Math.round(22 * s)}px system-ui`
    ctx.fillStyle = T.accent
    ctx.textAlign = 'center'
    ctx.fillText('mystandards.app', W / 2, H - Math.round(52 * s))

    ctx.beginPath()
    ctx.arc(W / 2, H - Math.round(28 * s), Math.round(5 * s), 0, Math.PI * 2)
    ctx.fillStyle = T.accent
    ctx.fill()
  }

  async function generatePhrase() {
    setLoadingPhrase(true)
    setError(null)
    try {
      const res = await fetch('/api/share-card/phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratio, searchPct, selfPct }),
      })
      const data = await res.json()
      if (data.phrase) setPhrase(data.phrase)
    } catch {
      setError('Erreur lors de la génération de la phrase.')
    } finally {
      setLoadingPhrase(false)
    }
  }

  async function downloadHD() {
    setLoadingImage(true)
    setError(null)
    try {
      const res = await fetch('/api/share-card/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratio, searchPct, selfPct, phrase, theme, format }),
      })
      if (!res.ok) throw new Error('Erreur génération image')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `miroirstats_${format}_${ratio}x.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Erreur lors du téléchargement.')
    } finally {
      setLoadingImage(false)
    }
  }

  // Styles inline cohérents avec le design system de l'app
  const btnBase: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    border: 'none',
  }

  const toggleBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.15s',
  }

  return (
    // Overlay
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet */}
      <div
        style={{
          width: '100%', maxWidth: '480px',
          background: '#111118',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>
            Partager ma carte
          </p>
          <button
            onClick={onClose}
            style={{ ...btnBase, background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '6px 12px' }}
          >
            ✕
          </button>
        </div>

        {/* Préview Canvas */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <canvas
            ref={canvasRef}
            style={{
              borderRadius: '12px',
              width: format === 'square' ? '260px' : '146px',
              height: format === 'square' ? '260px' : '260px',
              display: 'block',
            }}
          />
        </div>

        {/* Toggles format + thème */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['square', 'vertical'] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={{
                ...toggleBase,
                background: format === f ? '#C8FF00' : 'rgba(255,255,255,0.05)',
                color: format === f ? '#0A0A0F' : 'rgba(255,255,255,0.6)',
                border: format === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {f === 'square' ? '■ Carré' : '▬ Vertical'}
            </button>
          ))}
          {(['dark', 'light'] as Theme[]).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                ...toggleBase,
                background: theme === t ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                color: theme === t ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {t === 'dark' ? '◑ Sombre' : '○ Clair'}
            </button>
          ))}
        </div>

        {/* Phrase choc */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Phrase choc
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={phrase}
              onChange={e => setPhrase(e.target.value)}
              placeholder="Génère ou écris une phrase..."
              rows={2}
              style={{
                flex: 1, borderRadius: '10px', padding: '10px 12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '14px', resize: 'none',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={generatePhrase}
              disabled={loadingPhrase}
              style={{
                ...btnBase,
                background: 'rgba(200,255,0,0.12)',
                color: '#C8FF00',
                border: '1px solid rgba(200,255,0,0.25)',
                padding: '10px 14px',
                minWidth: '48px',
                opacity: loadingPhrase ? 0.5 : 1,
              }}
            >
              {loadingPhrase ? '...' : '✦'}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '13px', margin: 0 }}>{error}</p>
        )}

        {/* CTA download */}
        <button
          onClick={downloadHD}
          disabled={loadingImage}
          style={{
            ...btnBase,
            background: '#C8FF00',
            color: '#0A0A0F',
            width: '100%',
            fontSize: '15px',
            padding: '14px',
            opacity: loadingImage ? 0.6 : 1,
          }}
        >
          {loadingImage ? 'Génération...' : `↓ Télécharger en HD (1080×${format === 'square' ? '1080' : '1920'})`}
        </button>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', margin: 0 }}>
          La carte est générée sur nos serveurs · Aucun crédit débité
        </p>
      </div>
    </div>
  )
}
