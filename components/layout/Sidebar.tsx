'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, User, Package, CalendarDays, Briefcase, BarChart3, LogOut, X } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { createBrowserSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Usuario } from '@/types'

const navItems = [
  { href: '/painel/equipe', label: 'Team', icon: Users, roles: ['ADMIN', 'GERENTE'] },
  { href: '/painel/clientes', label: 'All Clients', icon: User, roles: ['ADMIN', 'GERENTE', 'CONSULTOR'] },
  { href: '/painel/produtos', label: 'Products', icon: Package, roles: ['ADMIN', 'GERENTE', 'CONSULTOR'] },
  { href: '/painel/agendamentos', label: 'Appointments', icon: CalendarDays, roles: ['ADMIN', 'GERENTE', 'CONSULTOR'] },
  { href: '/painel/servicos', label: 'Services', icon: Briefcase, roles: ['ADMIN', 'GERENTE'] },
  { href: '/painel/simulador', label: 'Simulator', icon: BarChart3, roles: ['ADMIN', 'GERENTE', 'CONSULTOR'] },
]

interface SidebarProps {
  usuario: Usuario
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ usuario, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserSupabase()

  const visibleItems = navItems.filter((item) => item.roles.includes(usuario.role))

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const roleLabel = usuario.role === 'ADMIN' ? 'Administrator' : usuario.role === 'GERENTE' ? 'Manager' : 'Advisor'

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest flex flex-col z-30 transition-transform duration-300',
      'lg:translate-x-0 lg:w-56',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="px-6 py-7 mb-2 flex items-center justify-between">
        <div>
          <p className="text-title-md font-bold text-primary">InvestPainel</p>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">Wealth Management</p>
        </div>
        <button onClick={onClose} className="lg:hidden h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low transition-weighted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-body-md transition-weighted group',
                isActive ? 'text-secondary font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-weighted flex-shrink-0', isActive ? 'text-secondary' : 'text-outline-variant group-hover:text-on-surface')} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
              {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-secondary-container" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-weighted group"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-label-sm font-semibold flex-shrink-0">
            {getInitials(usuario.nome)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-body-md text-on-surface font-medium truncate">{usuario.nome}</p>
            <p className="text-label-sm text-on-surface-variant truncate">{roleLabel}</p>
          </div>
          <LogOut className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-weighted" />
        </button>
      </div>
    </aside>
  )
}
