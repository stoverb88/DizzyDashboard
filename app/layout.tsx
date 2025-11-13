import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dizzy Dashboard',
  description: 'Clinical decision support for dizziness and vertigo evaluation',
  applicationName: 'Dizzy Dashboard',
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'Dizzy Dashboard',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#1A202C',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
