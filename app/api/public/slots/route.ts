import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

function validateApiKey(req: Request): boolean {
  const key = req.headers.get('X-API-Key')
  return key === process.env.API_KEY
}

export async function GET(req: Request) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data')
  const consultorId = searchParams.get('consultorId')

  if (!data || !consultorId) {
    return NextResponse.json({ error: 'data and consultorId are required' }, { status: 400 })
  }

  const service = createServiceSupabase()

  const startOfDay = `${data}T00:00:00.000Z`
  const endOfDay = `${data}T23:59:59.999Z`

  const { data: agendamentos } = await service
    .from('agendamentos')
    .select('data_hora, duracao_min')
    .eq('consultor_id', consultorId)
    .gte('data_hora', startOfDay)
    .lte('data_hora', endOfDay)
    .neq('status', 'CANCELADO')

  // Generate slots from 08:00 to 18:00 in 60-min increments
  const slots = []
  const base = new Date(`${data}T08:00:00`)
  for (let i = 0; i < 10; i++) {
    const slotTime = new Date(base.getTime() + i * 60 * 60 * 1000)
    const slotEnd = new Date(slotTime.getTime() + 60 * 60 * 1000)

    const occupied = (agendamentos ?? []).some((ag) => {
      const agStart = new Date(ag.data_hora)
      const agEnd = new Date(agStart.getTime() + ag.duracao_min * 60 * 1000)
      return slotTime < agEnd && slotEnd > agStart
    })

    if (!occupied) {
      slots.push({
        hora: slotTime.toISOString(),
        horaLocal: slotTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }

  return NextResponse.json({ data, consultorId, slots })
}
