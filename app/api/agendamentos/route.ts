import { NextResponse } from 'next/server'
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { sendEmail, emailConfirmacaoAgendamento } from '@/lib/email'

export async function POST(req: Request) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { cliente_id, consultor_id, data_hora, duracao_min, local, observacoes } = body

  const service = createServiceSupabase()

  const { data, error } = await service
    .from('agendamentos')
    .insert({ cliente_id, consultor_id, data_hora, duracao_min: parseInt(duracao_min), local, observacoes })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: cliente } = await service.from('clientes').select('nome, email').eq('id', cliente_id).single()
  const { data: consultor } = await service.from('usuarios').select('nome, email').eq('id', consultor_id).single()

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(data_hora))

  if (cliente?.email) {
    await sendEmail({
      to: cliente.email,
      subject: `Agendamento confirmado — ${dataFormatada}`,
      html: emailConfirmacaoAgendamento({
        clienteNome: cliente.nome,
        consultorNome: consultor?.nome ?? '—',
        dataHora: dataFormatada,
        local,
      }),
    })
  }

  return NextResponse.json(data, { status: 201 })
}
