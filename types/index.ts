export type RoleTipo = 'ADMIN' | 'GERENTE' | 'CONSULTOR'
export type StatusAgendamento = 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO'
export type StatusContrato = 'ATIVO' | 'VENCIDO' | 'CANCELADO'

export interface Usuario {
  id: string
  auth_id: string
  nome: string
  email: string
  role: RoleTipo
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Cliente {
  id: string
  nome: string
  cpf: string
  email: string | null
  telefone: string | null
  consultor_id: string
  criado_em: string
  atualizado_em: string
  consultor?: Usuario
  contratos?: Contrato[]
}

export interface Produto {
  id: string
  nome: string
  descricao: string | null
  tipo_aplicacao: string
  rentabilidade_anual: number | null
  prazo_minimo_dias: number | null
  valor_minimo: number | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Contrato {
  id: string
  cliente_id: string
  produto_id: string
  valor_investido: number
  data_entrada: string
  data_vencimento: string | null
  rentabilidade: number
  status: StatusContrato
  criado_em: string
  atualizado_em: string
  cliente?: Cliente
  produto?: Produto
}

export interface Agendamento {
  id: string
  cliente_id: string
  consultor_id: string
  data_hora: string
  duracao_min: number
  local: string
  observacoes: string | null
  status: StatusAgendamento
  criado_em: string
  atualizado_em: string
  cliente?: Cliente
  consultor?: Usuario
}

export interface Servico {
  id: string
  nome: string
  descricao: string | null
  duracao_min: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface LogNotificacao {
  id: string
  tipo: string
  destinatario: string
  assunto: string
  conteudo: string | null
  enviado_em: string
  sucesso: boolean
}
