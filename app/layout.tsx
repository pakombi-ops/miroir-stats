import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiroirStats — Tes standards face à la réalité',
  description: 'Découvre quel pourcentage de la population mondiale correspond à ce que tu cherches… et ce que toi tu représentes.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MiroirStats' },
  openGraph: { title: 'MiroirStats', description: 'Tes standards face à la réalité démographique mondiale', type: 'website' },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
