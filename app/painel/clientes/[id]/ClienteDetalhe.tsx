'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  cn, formatCurrency, formatDate, getInitials, calcularRentabilidadeAcumulada, diasParaVencimento,
} from '@/lib/utils'
import type { Cliente, Contrato, Produto, Usuario } from '@/types'

const COLORS = ['#002444', '#C9A84C', '#1B3A5C', '#755B00', '#43474E', '#73777F']

const TYPE_EN: Record<string, string> = {
  'Renda Fixa': 'Fixed Income',
  'Renda Variável': 'Equities',
  'Fundo Imobiliário': 'Real Estate',
  'Tesouro Direto': 'Gov. Bond',
  'Criptoativos': 'Crypto',
  'Multimercado': 'Multi-Asset',
}

interface Props {
  cliente: Cliente
  contratos: Contrato[]
  produtos: Produto[]
  usuario: Usuario
}

function patrimonioFontSize(value: number): string {
  const len = formatCurrency(value).length
  if (len > 18) return 'text-2xl'
  if (len > 14) return 'text-3xl'
  return 'text-4xl'
}

export default function ClienteDetalhe({ cliente, contratos, produtos, usuario }: Props) {
  const router = useRouter()
  const [showContrato, setShowContrato] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    produto_id: '',
    valor_investido: '',
    data_entrada: new Date().toISOString().slice(0, 10),
    data_vencimento: '',
  })

  const canEdit = usuario.role === 'ADMIN' || usuario.role === 'GERENTE'

  const contratosAtivos = contratos.filter((c) => c.status === 'ATIVO')
  const patrimonio = contratosAtivos.reduce((acc, c) => {
    const produto = (c as any).produto
    const rentab = calcularRentabilidadeAcumulada(c.valor_investido, produto?.rentabilidade_anual ?? 0, c.data_entrada)
    return acc + c.valor_investido + rentab
  }, 0)

  const totalInvestido = contratosAtivos.reduce((s, c) => s + c.valor_investido, 0)
  const rentabilidadeTotal = patrimonio - totalInvestido
  const percentRentab = totalInvestido > 0 ? (rentabilidadeTotal / totalInvestido) * 100 : 0

  const pieData = Object.entries(
    contratosAtivos.reduce((acc, c) => {
      const tipoRaw = (c as any).produto?.tipo_aplicacao ?? 'Other'
      const tipo = TYPE_EN[tipoRaw] ?? tipoRaw
      acc[tipo] = (acc[tipo] ?? 0) + c.valor_investido
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const lineData = Array.from({ length: 6 }, (_, i) => {
    const label = new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short' })
    return { mes: label, valor: Math.round(patrimonio * (0.9 + i * 0.02)) }
  })
  lineData[lineData.length - 1].valor = Math.round(patrimonio)

  const consultor = (cliente as any).consultor

  async function handleNovoContrato() {
    setSaving(true)
    const res = await fetch('/api/contratos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cliente_id: cliente.id }),
    })
    setSaving(false)
    if (res.ok) {
      setShowContrato(false)
      router.refresh()
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default">Private Banking</Badge>
          <Badge variant={contratosAtivos.length > 0 ? 'success' : 'muted'}>
            {contratosAtivos.length > 0 ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-display-lg font-bold text-on-surface leading-tight mb-2">
              {cliente.nome}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Investor since {formatDate(cliente.criado_em)} • Aggressive Profile
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {canEdit && (
              <Button variant="outline" onClick={() => setShowContrato(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Contract</span>
              </Button>
            )}
            <Button variant="primary">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">View Dashboard</span>
            </Button>
            <Button variant="secondary">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Meeting</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Registration Data */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded shadow-ambient p-5 sm:p-8">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-6">Registration Data</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">CPF / ID</p>
              <p className="text-body-md text-on-surface font-medium">{cliente.cpf}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Primary Email</p>
              <p className="text-body-md text-on-surface font-medium break-all">{cliente.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Phone</p>
              <p className="text-body-md text-on-surface font-medium">{cliente.telefone ?? '—'}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Advisor</p>
              <p className="text-body-md text-on-surface font-medium">{consultor?.nome ?? '—'}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-body-md text-on-surface font-medium">{formatDate(cliente.atualizado_em)}</p>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Contracts</p>
              <p className="text-body-md text-on-surface font-medium">{contratosAtivos.length}</p>
            </div>
          </div>
        </div>

        {/* Total Wealth */}
        <div className="bg-primary rounded-lg p-6 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-label-sm text-white/60 uppercase tracking-wider mb-3">Total Wealth</p>
            <p className={cn('font-bold text-white leading-tight break-words', patrimonioFontSize(patrimonio))}>
              {formatCurrency(patrimonio)}
            </p>
            <p className={cn('text-body-sm mt-2 font-medium', percentRentab >= 0 ? 'text-secondary-container' : 'text-red-300')}>
              {percentRentab >= 0 ? '↗' : '↘'} {percentRentab.toFixed(1)}% this month
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-label-sm text-white/60">Immediate Liquidity</p>
              <p className="text-body-md text-secondary-container font-semibold">
                {formatCurrency(totalInvestido * 0.18)}
              </p>
            </div>
            <div className="perspective-bar">
              <div className="perspective-bar-fill" style={{ width: '18%' }} />
              <div className="perspective-bar-dot" style={{ left: '18%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded shadow-ambient p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title-md font-semibold text-on-surface">Investment Portfolio</h2>
            <div className="flex gap-4">
              {['All', 'Fixed Income', 'Equities'].map((f) => (
                <button key={f} className="text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-primary transition-weighted">
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[32%]" />
                <col className="w-[24%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr>
                  {['Product', 'Allocated Value', 'Return', 'Maturity', 'Status'].map((h) => (
                    <th key={h} className="pb-4 text-left text-label-sm text-on-surface-variant uppercase tracking-wider pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => {
                  const produto = (c as any).produto
                  const pct = totalInvestido > 0 ? ((c.valor_investido / totalInvestido) * 100).toFixed(1) : '0'
                  const dias = c.data_vencimento ? diasParaVencimento(c.data_vencimento) : null
                  const venceBreve = dias !== null && dias <= 60 && dias > 0
                  const vencido = dias !== null && dias <= 0

                  return (
                    <tr key={c.id} className="border-t border-surface-container">
                      <td className="py-4 pr-3">
                        <p className="text-body-md font-medium text-on-surface truncate" title={produto?.nome ?? '—'}>
                          {produto?.nome ?? '—'}
                        </p>
                        <p className={cn('text-label-sm mt-0.5 truncate', venceBreve ? 'text-secondary' : 'text-on-surface-variant')}>
                          {TYPE_EN[produto?.tipo_aplicacao ?? ''] ?? produto?.tipo_aplicacao ?? ''}
                        </p>
                      </td>
                      <td className="py-4 pr-3">
                        <p className="text-body-md font-semibold text-on-surface whitespace-nowrap">{formatCurrency(c.valor_investido)}</p>
                        <p className="text-label-sm text-on-surface-variant">{pct}% of portfolio</p>
                      </td>
                      <td className="py-4 pr-3 whitespace-nowrap">
                        <span className={cn('text-body-md font-semibold', c.rentabilidade > 0 ? 'text-secondary' : 'text-on-surface')}>
                          {produto?.rentabilidade_anual ? `${produto.rentabilidade_anual}% p.a.` : `${c.rentabilidade.toFixed(2)}%`}
                        </span>
                      </td>
                      <td className="py-4 pr-3">
                        {c.data_vencimento ? (
                          <div>
                            <p className={cn('text-body-md whitespace-nowrap', venceBreve ? 'text-secondary font-semibold' : 'text-on-surface')}>
                              {formatDate(c.data_vencimento)}
                            </p>
                            <p className={cn('text-label-sm whitespace-nowrap', venceBreve ? 'text-secondary' : vencido ? 'text-red-600' : 'text-on-surface-variant')}>
                              {vencido ? 'Expired' : dias !== null ? `in ${dias}d` : ''}
                            </p>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-body-md">Open-ended</span>
                        )}
                      </td>
                      <td className="py-4">
                        <Badge variant={c.status === 'ATIVO' ? 'success' : c.status === 'VENCIDO' ? 'warning' : 'muted'}>
                          {c.status === 'ATIVO' ? 'Active' : c.status === 'VENCIDO' ? 'Expired' : 'Cancelled'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <button className="mt-6 text-body-sm text-on-surface-variant hover:text-on-surface transition-weighted uppercase tracking-wider flex items-center gap-1.5">
            Load Full History ↓
          </button>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {pieData.length > 0 && (
            <div className="bg-surface-container-lowest rounded shadow-ambient p-6">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Allocation by Type</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-label-sm text-on-surface-variant">{d.name}</span>
                    </div>
                    <span className="text-label-sm text-on-surface font-medium">
                      {totalInvestido > 0 ? ((d.value / totalInvestido) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface-container-lowest rounded shadow-ambient p-6">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Wealth Evolution</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={lineData}>
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#73777F' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="valor" stroke="#C9A84C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-t border-surface-container">
        <p className="text-label-sm text-on-surface-variant/60">
          Return figures are gross and based on previous closing price.
        </p>
        <div className="flex gap-4">
          <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-weighted uppercase tracking-wider">PDF Reports</button>
          <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-weighted uppercase tracking-wider">Send by Email</button>
        </div>
      </div>

      {/* New Contract Modal */}
      <Dialog open={showContrato} onOpenChange={setShowContrato}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={form.produto_id} onValueChange={(v) => setForm({ ...form, produto_id: v })}>
              <SelectTrigger label="Investment Product">
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input label="Invested Amount (R$)" type="number" value={form.valor_investido}
              onChange={(e) => setForm({ ...form, valor_investido: e.target.value })} placeholder="500000" />
            <Input label="Start Date" type="date" value={form.data_entrada}
              onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} />
            <Input label="Maturity Date (optional)" type="date" value={form.data_vencimento}
              onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowContrato(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleNovoContrato} disabled={saving || !form.produto_id || !form.valor_investido}>
              {saving ? 'Saving...' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
