import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'
import { sendEmail, emailConfirmacaoAgendamento } from '@/lib/email'

function validateApiKey(req: Request): boolean {
  return req.headers.get('X-API-Key') === process.env.API_KEY
}

export async function POST(req: Request) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clienteId, consultorId, dataHora, local, duracaoMin = 60 } = await req.json()

  if (!clienteId || !consultorId || !dataHora || !local) {
    return NextResponse.json({ error: 'clienteId, consultorId, dataHora and local are required' }, { status: 400 })
  }

  const service = createServiceSupabase()

  const { data, error } = await service
    .from('agendamentos')
    .insert({
      cliente_id: clienteId,
      consultor_id: consultorId,
      data_hora: dataHora,
      duracao_min: duracaoMin,
      local,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: cliente } = await service.from('clientes').select('nome, email').eq('id', clienteId).single()
  const { data: consultor } = await service.from('usuarios').select('nome').eq('id', consultorId).single()

  if (cliente?.email) {
    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dataHora))

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
