import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ProdutosView from './ProdutosView'
import type { Produto, Usuario } from '@/types'

export default async function ProdutosPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios').select('*').eq('auth_id', user.id).single()
  if (!usuario) redirect('/login')

  const { data: produtos } = await service.from('produtos').select('*').order('nome')

  return <ProdutosView produtos={(produtos ?? []) as Produto[]} usuario={usuario as Usuario} />
}
