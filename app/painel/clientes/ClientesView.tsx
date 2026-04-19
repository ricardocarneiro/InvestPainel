'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, MoreVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Cliente, Usuario } from '@/types'

const ITEMS_PER_PAGE = 5

interface Props {
  clientes: Cliente[]
  consultores: Usuario[]
  usuario: Usuario
}

export default function ClientesView({ clientes, consultores, usuario }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    consultor_id: usuario.role !== 'ADMIN' ? usuario.id : '',
  })

  const canEdit = usuario.role === 'ADMIN' || usuario.role === 'GERENTE'

  const filtered = clientes.filter(
    (c) => c.nome.toLowerCase().includes(search.toLowerCase()) || c.cpf.includes(search)
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalInvestido = clientes.reduce((acc, c) => {
    const contratos = (c as any).contratos ?? []
    return acc + contratos.filter((ct: any) => ct.status === 'ATIVO').reduce((s: number, ct: any) => s + ct.valor_investido, 0)
  }, 0)

  const ativos = clientes.filter((c) => {
    const contratos = (c as any).contratos ?? []
    return contratos.some((ct: any) => ct.status === 'ATIVO')
  }).length

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setShowModal(false)
      setForm({ nome: '', cpf: '', email: '', telefone: '', consultor_id: usuario.role !== 'ADMIN' ? usuario.id : '' })
      router.refresh()
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Client Management</h1>
          <p className="text-body-md text-on-surface-variant max-w-md hidden sm:block">
            View and manage your investor portfolio with executive precision and real-time data.
          </p>
        </div>
        {canEdit && (
          <Button variant="gold" onClick={() => setShowModal(true)} className="whitespace-nowrap flex-shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">+ New Client</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total AUM', value: compact(totalInvestido) },
          { label: 'Active Clients', value: ativos.toString() },
          { label: 'New This Month', value: `+${newThisMonth(clientes)}` },
          { label: 'Average Ticket', value: ativos > 0 ? compact(totalInvestido / ativos) : 'R$ 0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded shadow-ambient p-6">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-headline-md font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name or CPF..."
          className="w-full max-w-sm pl-9 pr-4 h-10 bg-surface-container-lowest rounded text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-weighted shadow-ambient"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded shadow-ambient overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-surface-container">
              {['Client Name', 'CPF', 'Total Invested', 'Contracts', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-label-sm text-on-surface-variant uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((cliente, i) => {
              const contratos = (cliente as any).contratos ?? []
              const ativo = contratos.some((c: any) => c.status === 'ATIVO')
              const totalCli = contratos.filter((c: any) => c.status === 'ATIVO').reduce((s: number, c: any) => s + c.valor_investido, 0)

              return (
                <tr key={cliente.id} className={cn('transition-weighted hover:bg-surface-container-low', i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface')}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white text-label-sm font-semibold flex-shrink-0">
                        {getInitials(cliente.nome)}
                      </div>
                      <Link href={`/painel/clientes/${cliente.id}`} className="text-body-md text-on-surface font-medium hover:text-primary transition-weighted">
                        {cliente.nome}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">{cliente.cpf}</td>
                  <td className="px-6 py-4">
                    <span className="text-body-md font-medium text-on-surface underline decoration-secondary-container decoration-2 underline-offset-2">
                      {formatCurrency(totalCli)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">{String(contratos.length).padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <Badge variant={ativo ? 'success' : 'muted'}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', ativo ? 'bg-emerald-500' : 'bg-outline-variant')} />
                      {ativo ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-weighted">
                      <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-surface-container">
          <p className="text-body-sm text-on-surface-variant">
            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} clients
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-weighted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={cn('h-8 w-8 flex items-center justify-center rounded text-body-sm transition-weighted',
                  page === p ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container')}>
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-on-surface-variant px-1">...</span>}
            {totalPages > 5 && (
              <button onClick={() => setPage(totalPages)}
                className={cn('h-8 w-8 flex items-center justify-center rounded text-body-sm transition-weighted',
                  page === totalPages ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:bg-surface-container')}>
                {totalPages}
              </button>
            )}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || totalPages === 0}
              className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-weighted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Retention Banner */}
      <div className="mt-6 bg-primary rounded-lg p-6 sm:p-8">
        <h3 className="text-title-md font-semibold text-white mb-2">Quarterly Retention Report</h3>
        <p className="text-body-md text-white/70 max-w-md mb-4">
          Your high-net-worth clients showed a 15% increase in new contributions this quarter. Consider scheduling portfolio reviews.
        </p>
        <button className="text-secondary-container text-body-md font-medium hover:text-secondary transition-weighted inline-flex items-center gap-1.5">
          View strategic details →
        </button>
      </div>

      {/* New Client Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Full Name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Dr. Ricardo Sampaio" />
            <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            <Input label="Phone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="+55 (11) 99999-9999" />
            {usuario.role === 'ADMIN' && (
              <Select value={form.consultor_id} onValueChange={(v) => setForm({ ...form, consultor_id: v })}>
                <SelectTrigger label="Responsible Advisor">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {consultores.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.nome || !form.cpf}>
              {saving ? 'Saving...' : 'Register Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function newThisMonth(clientes: Cliente[]): number {
  const now = new Date()
  return clientes.filter((c) => {
    const d = new Date(c.criado_em)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

function compact(v: number): string {
  if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)}K`
  return formatCurrency(v)
}
