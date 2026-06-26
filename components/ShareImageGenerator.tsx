'use client'

export function generateShareCanvas(
  searchPct: number,
  selfPct: number,
  ratio: number,
  viralPhrase: string
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No canvas context')); return }

      await document.fonts.ready

      // Fond sombre
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, 1080, 1080)

      // Gradient subtil
      const gradient = ctx.createRadialGradient(540, 400, 0, 540, 400, 600)
      gradient.addColorStop(0, 'rgba(163, 230, 53, 0.08)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1080, 1080)

      // Logo
      ctx.fillStyle = '#a3e635'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('MIROIR MIROIR', 540, 80)

      // Ligne séparatrice
      ctx.strokeStyle = 'rgba(163,230,53,0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(100, 110)
      ctx.lineTo(980, 110)
      ctx.stroke()

      // Ratio principal
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 160px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${ratio.toFixed(1)}x`, 540, 320)

      ctx.fillStyle = '#a3e635'
      ctx.font = '36px Arial'
      ctx.fillText("MON RATIO D'EXIGENCE", 540, 380)

      // Stats labels
      ctx.fillStyle = '#888888'
      ctx.font = '28px Arial'
      ctx.fillText('Ce que je cherche', 280, 480)
      ctx.fillText('Ce que je suis', 800, 480)

      // Stats valeurs
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 72px Arial'
      ctx.fillText(`${searchPct < 0.1 ? searchPct.toFixed(3) : searchPct.toFixed(1)}%`, 280, 570)
      ctx.fillText(`${selfPct < 0.1 ? selfPct.toFixed(3) : selfPct.toFixed(1)}%`, 800, 570)

      ctx.fillStyle = '#555555'
      ctx.font = '22px Arial'
      ctx.fillText('de la population', 280, 610)
      ctx.fillText('de la population', 800, 610)

      // Séparateur vertical
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(540, 460)
      ctx.lineTo(540, 630)
      ctx.stroke()

      // Phrase virale avec word wrap
      if (viralPhrase) {
        const maxWidth = 860
        ctx.fillStyle = '#cccccc'
        ctx.font = 'italic 34px Arial'
        ctx.textAlign = 'center'

        const words = viralPhrase.split(' ')
        const lines: string[] = []
        let currentLine = ''
        for (const word of words) {
          const test = currentLine ? `${currentLine} ${word}` : word
          if (ctx.measureText(test).width > maxWidth) {
            if (currentLine) lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = test
          }
        }
        if (currentLine) lines.push(currentLine)

        const lineHeight = 46
        const startY = 730 - ((lines.length - 1) * lineHeight) / 2
        lines.forEach((line, i) => {
          const prefix = i === 0 ? '"' : ''
          const suffix = i === lines.length - 1 ? '"' : ''
          ctx.fillText(`${prefix}${line}${suffix}`, 540, startY + i * lineHeight)
        })
      }

      // CTA
      ctx.fillStyle = '#a3e635'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('mystandards.app', 540, 960)
      ctx.fillStyle = '#555555'
      ctx.font = '22px Arial'
      ctx.fillText('Calcule ton ratio →', 540, 998)

      // Conversion en blob — méthode robuste
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob)
          } else {
            // Fallback : conversion manuelle via dataURL
            const dataURL = canvas.toDataURL('image/png')
            const arr = dataURL.split(',')
            const mime = arr[0].match(/:(.*?);/)![1]
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) u8arr[n] = bstr.charCodeAt(n)
            resolve(new Blob([u8arr], { type: mime }))
          }
        },
        'image/png',
        1.0
      )
    } catch (err) {
      reject(err)
    }
  })
}
