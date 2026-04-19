import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ServicosView from './ServicosView'
import type { Servico, Usuario } from '@/types'

export default async function ServicosPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios').select('*').eq('auth_id', user.id).single()
  if (!usuario) redirect('/login')
  if (usuario.role === 'CONSULTOR') redirect('/painel/clientes')

  const { data: servicos } = await service.from('servicos').select('*').order('nome')

  return <ServicosView servicos={(servicos ?? []) as Servico[]} usuario={usuario as Usuario} />
}
