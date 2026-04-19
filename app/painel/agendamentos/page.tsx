import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AgendamentosView from './AgendamentosView'
import type { Agendamento, Cliente, Usuario } from '@/types'

export default async function AgendamentosPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios').select('*').eq('auth_id', user.id).single()
  if (!usuario) redirect('/login')

  let agQuery = service
    .from('agendamentos')
    .select('*, cliente:clientes(id,nome), consultor:usuarios(id,nome)')
    .order('data_hora')

  if (usuario.role !== 'ADMIN') {
    agQuery = agQuery.eq('consultor_id', usuario.id)
  }

  const { data: agendamentos } = await agQuery

  let clQuery = service.from('clientes').select('id, nome').order('nome')
  if (usuario.role !== 'ADMIN') clQuery = clQuery.eq('consultor_id', usuario.id)
  const { data: clientes } = await clQuery

  return (
    <AgendamentosView
      agendamentos={(agendamentos ?? []) as Agendamento[]}
      clientes={(clientes ?? []) as Cliente[]}
      usuario={usuario as Usuario}
    />
  )
}
