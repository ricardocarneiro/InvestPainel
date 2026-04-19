import { NextResponse } from 'next/server'
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { sendEmail, emailNovoCliente } from '@/lib/email'

export async function POST(req: Request) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { nome, cpf, email, telefone, consultor_id } = body

  const service = createServiceSupabase()

  const { data: consultor } = await service
    .from('usuarios')
    .select('nome, email')
    .eq('id', consultor_id)
    .single()

  const { data, error } = await service
    .from('clientes')
    .insert({ nome, cpf, email, telefone, consultor_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Notificar admin
  const { data: admins } = await service
    .from('usuarios')
    .select('email')
    .eq('role', 'ADMIN')
    .eq('ativo', true)

  for (const admin of admins ?? []) {
    await sendEmail({
      to: admin.email,
      subject: `Novo cliente cadastrado: ${nome}`,
      html: emailNovoCliente({ clienteNome: nome, cpf, consultorNome: consultor?.nome ?? 'Não informado' }),
    })

    await service.from('log_notificacoes').insert({
      tipo: 'NOVO_CLIENTE',
      destinatario: admin.email,
      assunto: `Novo cliente cadastrado: ${nome}`,
      sucesso: true,
    })
  }

  return NextResponse.json(data, { status: 201 })
}
