import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arsip Data PBB',
  description: 'Aplikasi Arsip Data PBB - SPPT dan STTS',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
