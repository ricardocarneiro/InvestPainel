import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

function validateApiKey(req: Request): boolean {
  return req.headers.get('X-API-Key') === process.env.API_KEY
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceSupabase()

  const { error } = await service
    .from('agendamentos')
    .update({ status: 'CANCELADO', atualizado_em: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, id: params.id })
}
