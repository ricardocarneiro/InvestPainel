import { redirect } from 'next/navigation'
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import PainelShell from '@/components/layout/PainelShell'
import type { Usuario } from '@/types'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = createServiceSupabase()
  const { data: usuario } = await service
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!usuario) redirect('/login')

  return (
    <PainelShell usuario={usuario as Usuario}>
      {children}
    </PainelShell>
  )
}
