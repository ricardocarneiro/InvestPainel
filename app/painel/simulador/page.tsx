import { createServiceSupabase } from '@/lib/supabase-server'
import SimuladorView from './SimuladorView'
import type { Produto } from '@/types'

export default async function SimuladorPage() {
  const service = createServiceSupabase()
  const { data: produtos } = await service.from('produtos').select('*').eq('ativo', true).order('nome')
  return <SimuladorView produtos={(produtos ?? []) as Produto[]} />
}
