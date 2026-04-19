import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import ClienteDetalhe from './ClienteDetalhe'
import type { Cliente, Contrato, Produto, Usuario } from '@/types'

export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios').select('*').eq('auth_id', user.id).single()
  if (!usuario) redirect('/login')

  const { data: cliente } = await service
    .from('clientes')
    .select('*, consultor:usuarios(id,nome,email,role)')
    .eq('id', params.id)
    .single()

  if (!cliente) notFound()

  const { data: contratos } = await service
    .from('contratos')
    .select('*, produto:produtos(*)')
    .eq('cliente_id', params.id)
    .order('data_entrada', { ascending: false })

  const { data: produtos } = await service
    .from('produtos').select('*').eq('ativo', true).order('nome')

  return (
    <ClienteDetalhe
      cliente={cliente as Cliente}
      contratos={(contratos ?? []) as Contrato[]}
      produtos={(produtos ?? []) as Produto[]}
      usuario={usuario as Usuario}
    />
  )
}
