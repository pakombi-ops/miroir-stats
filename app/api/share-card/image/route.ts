import { NextRequest, NextResponse } from 'next/server'
import { createCanvas } from '@napi-rs/canvas'

type Theme = 'dark' | 'light'
type Format = 'square' | 'vertical'

const THEMES = {
  dark: {
    bg: '#0A0A0F',
    accent: '#C8FF00',
    text: '#FFFFFF',
    sub: 'rgba(255,255,255,0.45)',
    grid: 'rgba(255,255,255,0.03)',
    divider: 'rgba(255,255,255,0.12)',
  },
  light: {
    bg: '#F5F5F0',
    accent: '#0A0A0F',
    text: '#0A0A0F',
    sub: 'rgba(0,0,0,0.45)',
    grid: 'rgba(0,0,0,0.03)',
    divider: 'rgba(0,0,0,0.12)',
  },
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      lines.push(line.trim())
      line = word + ' '
    } else {
      line = test
    }
  }
  lines.push(line.trim())
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
}

function drawCard(
  width: number,
  height: number,
  ratio: number,
  searchPct: number,
  selfPct: number,
  phrase: string,
  theme: Theme
) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D
  const T = THEMES[theme]
  const s = width / 1080

  // Fond
  ctx.fillStyle = T.bg
  ctx.fillRect(0, 0, width, height)

  // Grille subtile
  ctx.strokeStyle = T.grid
  ctx.lineWidth = 1
  for (let i = 0; i < width; i += Math.round(80 * s)) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke()
  }

  // Barre accent top
  ctx.fillStyle = T.accent
  ctx.fillRect(0, 0, width, Math.round(6 * s))

  // Logo top-left
  ctx.font = `bold ${Math.round(24 * s)}px sans-serif`
  ctx.fillStyle = T.sub
  ctx.textAlign = 'left'
  ctx.fillText('MIROIR STATS', Math.round(60 * s), Math.round(80 * s))

  // Domaine top-right
  ctx.font = `${Math.round(22 * s)}px sans-serif`
  ctx.fillStyle = T.sub
  ctx.textAlign = 'right'
  ctx.fillText('mystandards.app', width - Math.round(60 * s), Math.round(80 * s))

  // Ratio (oversized)
  const ratioY = Math.round(height * (height === width ? 0.42 : 0.35))
  ctx.textAlign = 'center'
  ctx.font = `bold ${Math.round(220 * s)}px sans-serif`
  ctx.fillStyle = T.accent
  ctx.fillText(`${ratio}×`, width / 2, ratioY)

  // Label ratio
  ctx.font = `${Math.round(24 * s)}px sans-serif`
  ctx.fillStyle = T.sub
  ctx.fillText("RATIO D'EXIGENCE", width / 2, ratioY + Math.round(44 * s))

  // Séparateur + stats
  const statsY = Math.round(height * (height === width ? 0.60 : 0.50))
  const col1 = Math.round(width * 0.3)
  const col2 = Math.round(width * 0.7)

  ctx.strokeStyle = T.divider
  ctx.lineWidth = Math.round(1 * s)
  ctx.beginPath()
  ctx.moveTo(width / 2, statsY - Math.round(28 * s))
  ctx.lineTo(width / 2, statsY + Math.round(52 * s))
  ctx.stroke()

  // Je cherche
  ctx.font = `bold ${Math.round(52 * s)}px sans-serif`
  ctx.fillStyle = T.text
  ctx.textAlign = 'center'
  ctx.fillText(`${searchPct}%`, col1, statsY + Math.round(8 * s))
  ctx.font = `${Math.round(20 * s)}px sans-serif`
  ctx.fillStyle = T.sub
  ctx.fillText('JE CHERCHE', col1, statsY + Math.round(36 * s))

  // Je suis
  ctx.font = `bold ${Math.round(52 * s)}px sans-serif`
  ctx.fillStyle = T.text
  ctx.fillText(`${selfPct}%`, col2, statsY + Math.round(8 * s))
  ctx.font = `${Math.round(20 * s)}px sans-serif`
  ctx.fillStyle = T.sub
  ctx.fillText('JE SUIS', col2, statsY + Math.round(36 * s))

  // Phrase choc
  if (phrase) {
    const phraseY = Math.round(height * (height === width ? 0.75 : 0.65))
    ctx.font = `${Math.round(30 * s)}px sans-serif`
    ctx.fillStyle = T.text
    ctx.textAlign = 'center'
    wrapText(
      ctx,
      `"${phrase}"`,
      width / 2,
      phraseY,
      width - Math.round(120 * s),
      Math.round(44 * s)
    )
  }

  // Watermark bas
  ctx.font = `bold ${Math.round(22 * s)}px sans-serif`
  ctx.fillStyle = T.accent
  ctx.textAlign = 'center'
  ctx.fillText('mystandards.app', width / 2, height - Math.round(52 * s))

  // Dot accent
  ctx.beginPath()
  ctx.arc(width / 2, height - Math.round(28 * s), Math.round(5 * s), 0, Math.PI * 2)
  ctx.fillStyle = T.accent
  ctx.fill()

  return canvas
}

export async function POST(req: NextRequest) {
  try {
    const {
      ratio = 847,
      searchPct = 0.12,
      selfPct = 3.2,
      phrase = '',
      theme = 'dark' as Theme,
      format = 'square' as Format,
    } = await req.json()

    const width = 1080
    const height = format === 'square' ? 1080 : 1920

    const canvas = drawCard(width, height, ratio, searchPct, selfPct, phrase, theme)
    const buffer = await (canvas as any).encode('png')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="miroirstats_${format}_${ratio}x.png"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[share-card/image]', error)
    return NextResponse.json({ error: 'Erreur génération image' }, { status: 500 })
  }
}
