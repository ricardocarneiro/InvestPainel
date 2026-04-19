'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, formatDateTime, getInitials } from '@/lib/utils'
import type { Agendamento, Cliente, Usuario } from '@/types'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props { agendamentos: Agendamento[]; clientes: Cliente[]; usuario: Usuario }

export default function AgendamentosView({ agendamentos, clientes, usuario }: Props) {
  const router = useRouter()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ cliente_id: '', data_hora: '', duracao_min: '60', local: '', observacoes: '' })

  const canEdit = usuario.role !== 'CONSULTOR'

  const firstDay = new Date(ano, mes, 1).getDay()
  const daysInMonth = new Date(ano, mes + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  const agByDay = useMemo(() => {
    const map: Record<number, Agendamento[]> = {}
    agendamentos.forEach((ag) => {
      const d = new Date(ag.data_hora)
      if (d.getMonth() === mes && d.getFullYear() === ano) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(ag)
      }
    })
    return map
  }, [agendamentos, mes, ano])

  const upcoming = agendamentos
    .filter((ag) => new Date(ag.data_hora) >= new Date() && ag.status !== 'CANCELADO')
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
    .slice(0, 5)

  const weekMeetings = agendamentos.filter((ag) => {
    const d = new Date(ag.data_hora)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    return d >= startOfWeek && d < new Date(startOfWeek.getTime() + 7 * 86400000)
  }).length

  async function handleSave() {
    setSaving(true)
    await fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, consultor_id: usuario.id }),
    })
    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  async function handleConfirm(id: string) {
    await fetch(`/api/agendamentos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CONFIRMADO' }) })
    router.refresh()
  }

  async function handleCancel(id: string) {
    await fetch(`/api/agendamentos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CANCELADO' }) })
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-lg font-bold text-on-surface">Appointments</h1>
        {canEdit && (
          <Button variant="primary" onClick={() => setShowModal(true)} className="whitespace-nowrap">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule Meeting</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_320px] gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded shadow-ambient p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">{MONTHS[mes]} {ano}</h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5 hidden sm:block">Your prospecting and follow-up schedule.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex gap-2 mr-4">
                {['Month', 'Week'].map((v) => (
                  <button key={v} className={cn('px-3 h-8 rounded text-label-sm font-medium uppercase tracking-wider transition-weighted',
                    v === 'Month' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface')}>
                    {v}
                  </button>
                ))}
              </div>
              <button onClick={() => { if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1) }}
                className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container transition-weighted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => { if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1) }}
                className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container transition-weighted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mt-6 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-label-sm text-on-surface-variant uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const isToday = day === now.getDate() && mes === now.getMonth() && ano === now.getFullYear()
              const dayAgs = day ? (agByDay[day] ?? []) : []
              return (
                <div key={i} className={cn('min-h-[52px] sm:min-h-[80px] p-1 sm:p-2 border-t border-surface-container', day ? 'hover:bg-surface-container-low transition-weighted cursor-pointer' : '')}>
                  {day && (
                    <>
                      <span className={cn('inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-body-sm mb-1',
                        isToday ? 'bg-primary text-white font-semibold' : 'text-on-surface')}>
                        {day}
                      </span>
                      <div className="space-y-0.5 hidden sm:block">
                        {dayAgs.slice(0, 2).map((ag) => (
                          <div key={ag.id} className="text-label-sm text-primary bg-primary/8 rounded px-1.5 py-0.5 truncate">
                            {new Date(ag.data_hora).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – {(ag as any).cliente?.nome?.split(' ')[0]}
                          </div>
                        ))}
                        {dayAgs.length > 2 && <div className="text-label-sm text-on-surface-variant px-1">+{dayAgs.length - 2}</div>}
                      </div>
                      {dayAgs.length > 0 && (
                        <div className="sm:hidden flex gap-0.5 mt-0.5 flex-wrap">
                          {dayAgs.slice(0, 3).map((ag) => (
                            <span key={ag.id} className="w-1.5 h-1.5 rounded-full bg-primary" />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-label-sm text-secondary uppercase tracking-wider mb-0.5">
                  Today, {now.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
                </p>
                <h3 className="text-title-md font-semibold text-on-surface">Upcoming Meetings</h3>
              </div>
            </div>

            <div className="space-y-3">
              {upcoming.map((ag) => {
                const cliente = (ag as any).cliente
                const isPending = ag.status === 'AGENDADO'
                const isConfirmed = ag.status === 'CONFIRMADO'
                return (
                  <div key={ag.id} className="bg-surface-container-lowest rounded shadow-ambient p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white text-label-sm font-semibold flex-shrink-0">
                          {getInitials(cliente?.nome ?? '?')}
                        </div>
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">{cliente?.nome ?? '—'}</p>
                          <p className="text-label-sm text-on-surface-variant">Portfolio Review</p>
                        </div>
                      </div>
                      <Badge variant={isConfirmed ? 'success' : 'warning'}>{isConfirmed ? 'Confirmed' : 'Pending'}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{formatDateTime(ag.data_hora)} ({ag.duracao_min} min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{ag.local}</span>
                      </div>
                    </div>
                    {isPending && canEdit && (
                      <div className="flex gap-2 mt-3">
                        <Button variant="gold" size="sm" className="flex-1" onClick={() => handleConfirm(ag.id)}>
                          <Check className="h-3.5 w-3.5" /> Confirm
                        </Button>
                        <button onClick={() => handleCancel(ag.id)}
                          className="h-8 w-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-red-600 transition-weighted">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              {upcoming.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant">
                  <p className="text-body-sm">No upcoming meetings</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly metrics */}
          <div className="bg-primary rounded-lg p-5 sm:p-6">
            <p className="text-label-sm text-white/60 uppercase tracking-wider mb-2">Weekly Metrics</p>
            <p className="text-headline-md font-bold text-white mb-4">{weekMeetings} Meetings</p>
            <div className="perspective-bar" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="perspective-bar-fill" style={{ width: `${Math.min((weekMeetings / 20) * 100, 100)}%` }} />
              <div className="perspective-bar-dot" style={{ left: `${Math.min((weekMeetings / 20) * 100, 100)}%` }} />
            </div>
            <p className="text-label-sm text-white/50 mt-2">{Math.round((weekMeetings / 20) * 100)}% of Target</p>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
              <SelectTrigger label="Client"><SelectValue placeholder="Select client..." /></SelectTrigger>
              <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
            <Input label="Date & Time" type="datetime-local" value={form.data_hora} onChange={(e) => setForm({ ...form, data_hora: e.target.value })} />
            <Select value={form.duracao_min} onValueChange={(v) => setForm({ ...form, duracao_min: v })}>
              <SelectTrigger label="Duration"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['30', '45', '60', '90', '120'].map((d) => <SelectItem key={d} value={d}>{d} minutes</SelectItem>)}
              </SelectContent>
            </Select>
            <Input label="Location" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Main Office — Room A3" />
            <Input label="Notes (optional)" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Product presentation..." />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.cliente_id || !form.data_hora || !form.local}>
              {saving ? 'Scheduling...' : 'Confirm Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
