'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Produto } from '@/types'

interface Props { produtos: Produto[] }

const SCENARIOS = [
  { label: 'Conservative', taxa: 0.7, cor: '#43474E' },
  { label: 'Moderate', taxa: 1.0, cor: '#002444' },
  { label: 'Aggressive', taxa: 1.35, cor: '#C9A84C' },
]

function calcular(valorInicial: number, taxaAnual: number, meses: number): number {
  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1
  return valorInicial * Math.pow(1 + taxaMensal, meses)
}

export default function SimuladorView({ produtos }: Props) {
  const [valorInicial, setValorInicial] = useState('500000')
  const [produtoId, setProdutoId] = useState('')
  const [prazoMeses, setPrazoMeses] = useState(60)

  const produto = produtos.find((p) => p.id === produtoId)
  const taxaBase = produto?.rentabilidade_anual ?? 12

  const resultado = useMemo(() => calcular(parseFloat(valorInicial) || 0, taxaBase, prazoMeses), [valorInicial, taxaBase, prazoMeses])
  const ganhoTotal = resultado - (parseFloat(valorInicial) || 0)
  const pctGanho = parseFloat(valorInicial) > 0 ? (ganhoTotal / parseFloat(valorInicial)) * 100 : 0
  const rentabilidadeMensal = (Math.pow(1 + taxaBase / 100, 1 / 12) - 1) * 100

  const chartData = SCENARIOS.map((c) => ({
    name: c.label,
    valor: Math.round(calcular(parseFloat(valorInicial) || 0, taxaBase * c.taxa, prazoMeses)),
    cor: c.cor,
  }))

  const volatilidade = taxaBase < 8 ? 15 : taxaBase < 15 ? 50 : 80

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface mb-2">Investment Simulator</h1>
        <p className="text-body-md text-on-surface-variant max-w-lg hidden sm:block">
          Project your clients' financial future with precision. Compare risk scenarios and visualize wealth growth in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded shadow-ambient p-5 sm:p-6">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Projection Parameters</p>
            <div className="space-y-5">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Initial Amount (R$)</p>
                <input type="number" value={valorInicial} onChange={(e) => setValorInicial(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded text-body-md text-on-surface border-b border-transparent focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary transition-weighted"
                />
              </div>

              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Strategic Product</p>
                <Select value={produtoId} onValueChange={setProdutoId}>
                  <SelectTrigger><SelectValue placeholder="Select a product..." /></SelectTrigger>
                  <SelectContent>
                    {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Investment Term</p>
                  <p className="text-title-md font-bold text-on-surface">{prazoMeses} <span className="text-body-sm text-on-surface-variant">months</span></p>
                </div>
                <input type="range" min={1} max={120} value={prazoMeses} onChange={(e) => setPrazoMeses(parseInt(e.target.value))}
                  className="w-full h-0.5 appearance-none rounded-full cursor-pointer"
                  style={{ background: `linear-gradient(to right, #C9A84C ${(prazoMeses / 120) * 100}%, #E7E8EA ${(prazoMeses / 120) * 100}%)` }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-label-sm text-on-surface-variant">1 month</span>
                  <span className="text-label-sm text-on-surface-variant">10 years</span>
                </div>
              </div>

              <Button variant="primary" className="w-full">
                Run Projection <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-primary rounded-lg p-5 sm:p-6">
            <p className="text-label-sm text-white/60 uppercase tracking-wider mb-2">Estimated Final Value</p>
            <p className="text-4xl font-bold text-white leading-tight break-words">{formatCurrency(resultado)}</p>
            <p className="text-body-md text-secondary-container mt-2 font-medium">↑ +{pctGanho.toFixed(1)}% total gain</p>
          </div>

          <div className="bg-surface-container-lowest rounded shadow-ambient p-5 sm:p-6">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Net Monthly Return</p>
            <p className="text-headline-md font-bold text-on-surface">{rentabilidadeMensal.toFixed(2)}% p.m.</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
              <p className="text-body-sm text-emerald-700">Above benchmark</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4 md:col-span-2 lg:col-span-1">
          <div className="bg-surface-container-lowest rounded shadow-ambient p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Scenario Comparison</p>
              <div className="flex gap-3">
                {SCENARIOS.map((c) => (
                  <div key={c.label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.cor }} />
                    <span className="text-label-sm text-on-surface-variant">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#73777F' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-2">
              {chartData.map((d) => (
                <p key={d.name} className="text-label-sm text-on-surface-variant">
                  {d.valor >= 1e6 ? `R$ ${(d.valor / 1e6).toFixed(1)}M` : `R$ ${(d.valor / 1e3).toFixed(0)}K`}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded shadow-ambient p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Estimated Volatility</p>
              <p className="text-body-sm font-semibold text-secondary">
                {volatilidade < 30 ? 'Low to Medium' : volatilidade < 70 ? 'Medium' : 'High'}
              </p>
            </div>
            <div className="perspective-bar">
              <div className="perspective-bar-fill" style={{ width: `${volatilidade}%` }} />
              <div className="perspective-bar-dot" style={{ left: `${volatilidade}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-label-sm text-on-surface-variant">Predictable</span>
              <span className="text-label-sm text-on-surface-variant">Volatile</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-label-sm text-on-surface-variant/50 text-center mt-10 uppercase tracking-wider">
        Simulations are based on historical data and do not guarantee future returns. InvestPainel Wealth Management © 2024
      </p>
    </div>
  )
}
