'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import type { Usuario } from '@/types'

interface Props { usuario: Usuario; children: React.ReactNode }

export default function PainelShell({ usuario, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar usuario={usuario} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-56">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
