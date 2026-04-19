import { NextResponse } from 'next/server'
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { sendEmail, emailNovoContrato } from '@/lib/email'

export async function POST(req: Request) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { cliente_id, produto_id, valor_investido, data_entrada, data_vencimento } = body

  const service = createServiceSupabase()

  const { data: produto } = await service.from('produtos').select('nome, rentabilidade_anual').eq('id', produto_id).single()
  const { data: cliente } = await service.from('clientes').select('nome, consultor:usuarios(nome, email)').eq('id', cliente_id).single()

  const { data, error } = await service
    .from('contratos')
    .insert({
      cliente_id,
      produto_id,
      valor_investido: parseFloat(valor_investido),
      data_entrada,
      data_vencimento: data_vencimento || null,
      rentabilidade: produto?.rentabilidade_anual ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const consultor = (cliente as any)?.consultor
  const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(valor_investido))

  const { data: admins } = await service.from('usuarios').select('email').eq('role', 'ADMIN').eq('ativo', true)
  for (const admin of admins ?? []) {
    await sendEmail({
      to: admin.email,
      subject: `Novo contrato: ${cliente?.nome} — ${produto?.nome}`,
      html: emailNovoContrato({
        clienteNome: cliente?.nome ?? '—',
        produtoNome: produto?.nome ?? '—',
        valorInvestido: valorFormatado,
        consultorNome: consultor?.nome ?? '—',
      }),
    })
  }

  return NextResponse.json(data, { status: 201 })
}
