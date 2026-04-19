'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, TrendingUp, RefreshCw, BarChart, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Servico, Usuario } from '@/types'

interface Props { servicos: Servico[]; usuario: Usuario }

export default function ServicosView({ servicos, usuario }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', duracao_min: '60' })
  const [portalAtivo, setPortalAtivo] = useState(true)

  const isAdmin = usuario.role === 'ADMIN'

  function getIcon(servico: Servico) {
    const nome = servico.nome.toLowerCase()
    if (nome.includes('review') || nome.includes('revisão') || nome.includes('carteira')) return RefreshCw
    if (nome.includes('equit') || nome.includes('ações') || nome.includes('setup')) return BarChart
    if (nome.includes('succession') || nome.includes('sucessório') || nome.includes('planejamento')) return Landmark
    return TrendingUp
  }

  function openEdit(s: Servico) {
    setEditingServico(s)
    setForm({ nome: s.nome, descricao: s.descricao ?? '', duracao_min: String(s.duracao_min) })
    setShowModal(true)
  }

  function openNew() {
    setEditingServico(null)
    setForm({ nome: '', descricao: '', duracao_min: '60' })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    if (editingServico) {
      await fetch(`/api/servicos/${editingServico.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duracao_min: parseInt(form.duracao_min) }),
      })
    } else {
      await fetch('/api/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duracao_min: parseInt(form.duracao_min) }),
      })
    }
    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="min-w-0">
          <p className="text-label-sm text-secondary uppercase tracking-wider mb-2">Settings</p>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Service Configuration</h1>
          <p className="text-body-md text-on-surface-variant max-w-lg hidden sm:block">
            Manage the service types available for your client portfolio. Set default durations and descriptions shown on scheduling portals.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openNew} className="whitespace-nowrap flex-shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Service</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded shadow-ambient divide-y divide-surface-container">
        {servicos.map((s) => {
          const Icon = getIcon(s)
          return (
            <div key={s.id} className="flex items-center gap-4 p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-surface-container flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-on-surface-variant" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-title-sm font-semibold text-on-surface truncate">{s.nome}</p>
                <p className="text-label-sm text-secondary uppercase tracking-wider mt-0.5">Strategic Level</p>
                <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1 sm:hidden">{s.descricao}</p>
              </div>
              <p className="text-body-sm text-on-surface-variant max-w-[160px] truncate hidden md:block">{s.descricao}</p>
              <div className="text-right flex-shrink-0">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider hidden sm:block">Duration</p>
                <p className="text-title-sm font-bold text-on-surface">{s.duracao_min}<span className="text-label-sm font-normal text-on-surface-variant"> min</span></p>
              </div>
              {isAdmin && (
                <button onClick={() => openEdit(s)}
                  className="h-9 w-9 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-weighted flex-shrink-0">
                  <Edit2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pt-8 border-t border-surface-container">
        <div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Data Integrity</p>
          <p className="text-body-sm text-on-surface-variant max-w-sm">
            All service changes are recorded in the audit log. Duration changes do not affect already confirmed appointments.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Portal Visibility</p>
          <div className="flex items-center gap-3 sm:justify-end">
            <button onClick={() => setPortalAtivo(!portalAtivo)}
              className={`relative w-10 h-5 rounded-full transition-weighted ${portalAtivo ? 'bg-secondary-container' : 'bg-outline-variant'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-weighted ${portalAtivo ? 'left-5' : 'left-0.5'}`} />
            </button>
            <p className="text-body-sm text-on-surface">Self-scheduling {portalAtivo ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingServico ? 'Edit Service' : 'New Service'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Service Name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input label="Description" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            <Input label="Duration (minutes)" type="number" value={form.duracao_min} onChange={(e) => setForm({ ...form, duracao_min: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.nome}>
              {saving ? 'Saving...' : editingServico ? 'Update' : 'Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
