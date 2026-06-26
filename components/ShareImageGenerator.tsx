'use client'
import { useRef, useCallback } from 'react'

interface ShareImageProps {
  searchPct: number
  selfPct: number
  ratio: number
  viralPhrase: string
  onGenerated?: (blob: Blob) => void
}

export function generateShareCanvas(
  searchPct: number,
  selfPct: number,
  ratio: number,
  viralPhrase: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')!

    // Fond sombre
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 1080, 1080)

    // Gradient subtil
    const gradient = ctx.createRadialGradient(540, 400, 0, 540, 400, 600)
    gradient.addColorStop(0, 'rgba(163, 230, 53, 0.08)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Logo
    ctx.fillStyle = '#a3e635'
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('MIROIR MIROIR', 540, 80)

    // Ligne séparatrice
    ctx.strokeStyle = '#a3e63540'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(100, 110)
    ctx.lineTo(980, 110)
    ctx.stroke()

    // Ratio principal
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 160px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`${ratio.toFixed(1)}x`, 540, 320)

    ctx.fillStyle = '#a3e635'
    ctx.font = '36px system-ui'
    ctx.fillText("MON RATIO D'EXIGENCE", 540, 380)

    // Stats
    ctx.fillStyle = '#888888'
    ctx.font = '28px system-ui'
    ctx.fillText('Ce que je cherche', 280, 480)
    ctx.fillText('Ce que je suis', 800, 480)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui'
    ctx.fillText(`${searchPct < 0.1 ? searchPct.toFixed(3) : searchPct.toFixed(1)}%`, 280, 570)
    ctx.fillText(`${selfPct < 0.1 ? selfPct.toFixed(3) : selfPct.toFixed(1)}%`, 800, 570)

    ctx.fillStyle = '#555555'
    ctx.font = '22px system-ui'
    ctx.fillText('de la population', 280, 610)
    ctx.fillText('de la population', 800, 610)

    // Séparateur vertical
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(540, 460)
    ctx.lineTo(540, 630)
    ctx.stroke()

    // Phrase virale
    const maxWidth = 860
    ctx.fillStyle = '#cccccc'
    ctx.font = 'italic 34px system-ui'
    ctx.textAlign = 'center'
    
    // Wrap text
    const words = viralPhrase.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = test
      }
    }
    lines.push(currentLine)
    
    const lineHeight = 46
    const startY = 720 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, i) => {
      ctx.fillText(`"${i === 0 ? '' : ''}${line}${i === lines.length - 1 ? '"' : ''}`, 540, startY + i * lineHeight)
    })

    // CTA
    ctx.fillStyle = '#a3e635'
    ctx.font = 'bold 28px system-ui'
    ctx.fillText('mystandards.app', 540, 960)
    ctx.fillStyle = '#555555'
    ctx.font = '22px system-ui'
    ctx.fillText('Calcule ton ratio →', 540, 998)

    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}