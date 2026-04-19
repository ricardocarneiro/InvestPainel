import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ClientesView from './ClientesView'
import type { Cliente, Usuario } from '@/types'

export default async function ClientesPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use service client so RLS doesn't block reading own usuario row
  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!usuario) redirect('/login')

  let query = service
    .from('clientes')
    .select('*, consultor:usuarios(id,nome,email,role), contratos(id,valor_investido,status)')
    .order('criado_em', { ascending: false })

  if (usuario.role !== 'ADMIN') {
    query = query.eq('consultor_id', usuario.id)
  }

  const { data: clientes } = await query

  const { data: consultores } = await service
    .from('usuarios')
    .select('id, nome, email, role')
    .eq('ativo', true)
    .order('nome')

  return (
    <ClientesView
      clientes={(clientes ?? []) as Cliente[]}
      consultores={(consultores ?? []) as Usuario[]}
      usuario={usuario as Usuario}
    />
  )
}
