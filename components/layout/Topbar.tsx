'use client'

import { Bell, Settings, Search, Menu } from 'lucide-react'
import Link from 'next/link'

interface TopbarProps {
  placeholder?: string
  onMenuToggle?: () => void
}

export default function Topbar({ placeholder = 'Search...', onMenuToggle }: TopbarProps) {
  return (
    <header className="glass fixed top-0 left-0 right-0 lg:left-56 z-10 h-16 flex items-center px-4 sm:px-8 gap-4 border-b border-outline-variant/10">
      <button
        onClick={onMenuToggle}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-weighted flex-shrink-0"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" strokeWidth={1.5} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-9 pr-4 h-9 bg-surface-container-low rounded text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-weighted"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="h-9 w-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-weighted">
          <Bell className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <Link href="/painel/configuracoes" className="h-9 w-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-weighted">
          <Settings className="h-5 w-5" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  )
}
