import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InvestPainel — Wealth Management',
  description: 'Sistema de gestão para consultores de investimentos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
