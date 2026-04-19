'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatarValorCompacto, getInitials } from '@/lib/utils'
import type { Usuario } from '@/types'

interface ConsultorComDados extends Usuario {
  clientes: Array<{ id: string; contratos: Array<{ id: string; valor_investido: number; status: string }> }>
}

interface Props { consultores: ConsultorComDados[]; usuario: Usuario }

export default function EquipeView({ consultores, usuario }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'CONSULTOR' })

  const isAdmin = usuario.role === 'ADMIN'

  function calcMetrics(c: ConsultorComDados) {
    const totalClientes = c.clientes?.length ?? 0
    const totalInvestido = c.clientes?.reduce((acc, cl) =>
      acc + (cl.contratos ?? []).filter(ct => ct.status === 'ATIVO').reduce((s, ct) => s + ct.valor_investido, 0), 0
    ) ?? 0
    const contratos = c.clientes?.reduce((acc, cl) => acc + (cl.contratos?.length ?? 0), 0) ?? 0
    return { totalClientes, totalInvestido, contratos }
  }

  const totalMetrics = consultores.reduce((acc, c) => {
    const m = calcMetrics(c)
    return { clientes: acc.clientes + m.totalClientes, investido: acc.investido + m.totalInvestido, contratos: acc.contratos + m.contratos }
  }, { clientes: 0, investido: 0, contratos: 0 })

  async function handleSave() {
    setSaving(true)
    await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  const roleLabel = (role: string) =>
    role === 'ADMIN' ? 'Administrator' : role === 'GERENTE' ? 'Senior Manager' : 'Advisor'

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Team Overview</h1>
          <p className="text-body-md text-on-surface-variant hidden sm:block">
            Manage performance and portfolio allocation of advisors in your Wealth Management unit.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowModal(true)} className="whitespace-nowrap flex-shrink-0">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Advisor</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {/* Consolidated metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-surface-container-lowest rounded shadow-ambient p-6">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Clients</p>
          <p className="text-headline-lg font-bold text-on-surface">{totalMetrics.clientes} <span className="text-secondary text-title-md">+12%</span></p>
          <div className="perspective-bar mt-3">
            <div className="perspective-bar-fill" style={{ width: '72%' }} />
            <div className="perspective-bar-dot" style={{ left: '72%' }} />
          </div>
        </div>
        <div className="bg-primary rounded-lg p-6">
          <p className="text-label-sm text-white/60 uppercase tracking-wider mb-2">Total AUM</p>
          <p className="text-headline-lg font-bold text-white">{formatarValorCompacto(totalMetrics.investido)} <span className="text-secondary-container text-label-sm">On Target</span></p>
          <div className="perspective-bar mt-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="perspective-bar-fill" style={{ width: '85%' }} />
            <div className="perspective-bar-dot" style={{ left: '85%' }} />
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded shadow-ambient p-6">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Active Contracts</p>
          <p className="text-headline-lg font-bold text-on-surface">{totalMetrics.contratos.toLocaleString('en-US')} <span className="text-on-surface-variant text-label-sm">Stable</span></p>
          <div className="perspective-bar mt-3">
            <div className="perspective-bar-fill" style={{ width: '60%' }} />
            <div className="perspective-bar-dot" style={{ left: '60%' }} />
          </div>
        </div>
      </div>

      {/* Advisory Board */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-title-lg font-semibold text-on-surface">Advisory Board</h2>
        <div className="flex gap-4">
          <button className="text-label-sm text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-weighted">Sort by AUM</button>
          <button className="text-label-sm text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-weighted">Filter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultores.map((c) => {
          const m = calcMetrics(c)
          return (
            <div key={c.id} className="bg-surface-container-lowest rounded shadow-ambient p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white font-semibold text-title-sm">
                    {getInitials(c.nome)}
                  </div>
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">{c.nome}</p>
                    <p className="text-label-sm text-on-surface-variant">{roleLabel(c.role)}</p>
                  </div>
                </div>
                <Badge variant={c.ativo ? 'success' : 'muted'}>{c.ativo ? 'Active' : 'Offline'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-container">
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Clients</p>
                  <p className="text-title-md font-bold text-on-surface">{m.totalClientes}</p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">AUM</p>
                  <p className="text-title-md font-bold text-on-surface">{formatarValorCompacto(m.totalInvestido)}</p>
                </div>
              </div>
            </div>
          )
        })}

        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="bg-surface-container-low rounded border-2 border-dashed border-outline-variant/30 p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:bg-surface-container transition-weighted group">
            <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-weighted text-xl">+</span>
            <p className="text-label-sm font-semibold text-on-surface-variant group-hover:text-on-surface transition-weighted">Expand Team</p>
            <p className="text-label-sm text-on-surface-variant/60">Add open position</p>
          </button>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Advisor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Full Name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input label="Corporate Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Temporary Password" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger label="Access Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSULTOR">Advisor</SelectItem>
                <SelectItem value="GERENTE">Manager</SelectItem>
                {isAdmin && <SelectItem value="ADMIN">Administrator</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.nome || !form.email || !form.senha}>
              {saving ? 'Creating...' : 'Create Advisor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
