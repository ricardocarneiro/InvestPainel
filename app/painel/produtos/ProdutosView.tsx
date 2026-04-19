'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Produto, Usuario } from '@/types'

const TIPOS = ['Fixed Income', 'Equities', 'Real Estate Fund', 'Government Bond', 'Crypto', 'Multi-Asset']
const FILTROS = ['ALL', 'FIXED INCOME', 'FUNDS']

interface Props { produtos: Produto[]; usuario: Usuario }

export default function ProdutosView({ produtos, usuario }: Props) {
  const router = useRouter()
  const [filtro, setFiltro] = useState('ALL')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nome: '', descricao: '', tipo_aplicacao: 'Fixed Income',
    rentabilidade_anual: '', prazo_minimo_dias: '', valor_minimo: '',
  })

  const canEdit = usuario.role === 'ADMIN' || usuario.role === 'GERENTE'

  const filtered = filtro === 'ALL' ? produtos
    : filtro === 'FIXED INCOME' ? produtos.filter(p => p.tipo_aplicacao === 'Fixed Income' || p.tipo_aplicacao === 'Renda Fixa' || p.tipo_aplicacao === 'Government Bond' || p.tipo_aplicacao === 'Tesouro Direto')
    : produtos.filter(p => p.tipo_aplicacao === 'Real Estate Fund' || p.tipo_aplicacao === 'Fundo Imobiliário' || p.tipo_aplicacao === 'Multi-Asset' || p.tipo_aplicacao === 'Multimercado')

  async function handleSave() {
    setSaving(true)
    await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        rentabilidade_anual: form.rentabilidade_anual ? parseFloat(form.rentabilidade_anual) : null,
        prazo_minimo_dias: form.prazo_minimo_dias ? parseInt(form.prazo_minimo_dias) : null,
        valor_minimo: form.valor_minimo ? parseFloat(form.valor_minimo) : null,
      }),
    })
    setSaving(false)
    setForm({ nome: '', descricao: '', tipo_aplicacao: 'Fixed Income', rentabilidade_anual: '', prazo_minimo_dias: '', valor_minimo: '' })
    setShowForm(false)
    router.refresh()
  }

  async function handleToggle(produto: Produto) {
    await fetch(`/api/produtos/${produto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !produto.ativo }),
    })
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-label-sm text-secondary uppercase tracking-wider mb-2">Asset Management</p>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Financial Product Catalog</h1>
          <div className="w-10 h-0.5 bg-secondary-container" />
        </div>
        {canEdit && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)} className="whitespace-nowrap flex-shrink-0 lg:hidden">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Product</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New product form */}
        {canEdit && (
          <div className={cn('lg:col-span-1 space-y-6', showForm ? 'block' : 'hidden lg:block')}>
            <div className="bg-surface-container-lowest rounded shadow-ambient p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="h-4 w-4 text-on-surface-variant" strokeWidth={1.5} />
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">New Product</p>
              </div>
              <div className="space-y-4">
                <Input label="Asset Name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Premium Fixed Income 2026" />
                <Select value={form.tipo_aplicacao} onValueChange={(v) => setForm({ ...form, tipo_aplicacao: v })}>
                  <SelectTrigger label="Product Type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Return" value={form.rentabilidade_anual} onChange={(e) => setForm({ ...form, rentabilidade_anual: e.target.value })} placeholder="Ex: 12% p.a." />
                  <Input label="Liquidity" value={form.prazo_minimo_dias} onChange={(e) => setForm({ ...form, prazo_minimo_dias: e.target.value })} placeholder="Ex: D+30" />
                </div>
                <Button variant="primary" className="w-full" onClick={handleSave} disabled={saving || !form.nome}>
                  {saving ? 'Registering...' : <><Plus className="h-4 w-4" /> Register Asset</>}
                </Button>
              </div>
            </div>

            <div className="bg-primary rounded-lg p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/50 to-transparent" />
              <div className="relative z-10">
                <p className="text-label-sm text-white/60 uppercase tracking-wider mb-2">Market Status</p>
                <p className="text-body-md text-white font-medium">Data updated via Bloomberg Terminal</p>
                <p className="text-label-sm text-white/50 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>
        )}

        {/* Product list */}
        <div className={cn('space-y-3', canEdit ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto">
              {FILTROS.map((f) => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={cn('text-label-sm uppercase tracking-wider transition-weighted pb-1 whitespace-nowrap',
                    filtro === f ? 'text-primary border-b-2 border-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface')}>
                  {f}
                </button>
              ))}
            </div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
              {filtered.length} assets
            </p>
          </div>

          {filtered.map((p) => (
            <div key={p.id} className={cn('bg-surface-container-lowest rounded shadow-ambient p-4 sm:p-5 flex items-center gap-3 sm:gap-4', !p.ativo && 'opacity-60')}>
              <div className="flex-1 min-w-0">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5 truncate">{p.tipo_aplicacao}</p>
                <p className="text-title-sm font-semibold text-on-surface truncate">{p.nome}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5 hidden sm:block">Return</p>
                <p className={cn('text-body-md font-semibold', p.rentabilidade_anual ? 'text-secondary' : 'text-on-surface-variant')}>
                  {p.rentabilidade_anual ? `${p.rentabilidade_anual}%` : '—'}
                </p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5">Liquidity</p>
                <p className="text-body-md text-on-surface">{p.prazo_minimo_dias ? `D+${p.prazo_minimo_dias}` : '—'}</p>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(p)}
                    className={cn('relative w-10 h-5 rounded-full transition-weighted', p.ativo ? 'bg-secondary-container' : 'bg-outline-variant')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-weighted', p.ativo ? 'left-5' : 'left-0.5')} />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container transition-weighted">
                    <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Benchmarking */}
          <div className="mt-8 pt-8 border-t border-surface-container">
            <div className="flex items-end justify-between mb-4 gap-4">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Quarterly Benchmarking</p>
                <p className="text-title-md font-semibold text-on-surface">Avg. Portfolio vs. Benchmark</p>
              </div>
              <p className="text-headline-sm font-bold text-secondary flex-shrink-0">+4.2%</p>
            </div>
            <div className="relative h-0.5 bg-surface-container-high rounded-full">
              <div className="perspective-bar-fill" style={{ width: '60%' }} />
              <div className="perspective-bar-dot" style={{ left: '40%' }} />
              <div className="perspective-bar-dot" style={{ left: '60%', background: '#002444' }} />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-label-sm text-on-surface-variant">Benchmark</p>
              <p className="text-label-sm text-secondary">Alpha Realized</p>
              <p className="text-label-sm text-on-surface-variant">Portfolio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
