import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import EquipeView from './EquipeView'
import type { Usuario } from '@/types'

export default async function EquipePage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios').select('*').eq('auth_id', user.id).single()

  if (!usuario) redirect('/login')
  if (usuario.role === 'CONSULTOR') redirect('/painel/clientes')

  const { data: consultores } = await service
    .from('usuarios')
    .select('*, clientes(id, contratos(id, valor_investido, status))')
    .order('nome')

  return <EquipeView consultores={(consultores ?? []) as any[]} usuario={usuario as Usuario} />
}
