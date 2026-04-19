-- InvestPainel — Supabase Schema
-- Run this in the Supabase SQL Editor

CREATE TYPE role_tipo AS ENUM ('ADMIN', 'GERENTE', 'CONSULTOR');
CREATE TYPE status_agendamento AS ENUM ('AGENDADO', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO');
CREATE TYPE status_contrato AS ENUM ('ATIVO', 'VENCIDO', 'CANCELADO');

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role role_tipo NOT NULL DEFAULT 'CONSULTOR',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  email TEXT,
  telefone TEXT,
  consultor_id UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_aplicacao TEXT NOT NULL,
  rentabilidade_anual DOUBLE PRECISION,
  prazo_minimo_dias INTEGER,
  valor_minimo DOUBLE PRECISION,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  valor_investido DOUBLE PRECISION NOT NULL,
  data_entrada TIMESTAMPTZ NOT NULL,
  data_vencimento TIMESTAMPTZ,
  rentabilidade DOUBLE PRECISION NOT NULL DEFAULT 0,
  status status_contrato NOT NULL DEFAULT 'ATIVO',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  consultor_id UUID NOT NULL REFERENCES usuarios(id),
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_min INTEGER NOT NULL DEFAULT 60,
  local TEXT NOT NULL,
  observacoes TEXT,
  status status_agendamento NOT NULL DEFAULT 'AGENDADO',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_min INTEGER NOT NULL DEFAULT 60,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE log_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  conteudo TEXT,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  sucesso BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- Helper functions
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS role_tipo
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_notificacoes ENABLE ROW LEVEL SECURITY;

-- usuarios: todos autenticados podem ver; apenas ADMIN gerencia
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "usuarios_insert" ON usuarios FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'ADMIN');
CREATE POLICY "usuarios_update" ON usuarios FOR UPDATE TO authenticated USING (get_user_role() = 'ADMIN');

-- clientes
CREATE POLICY "clientes_select_admin" ON clientes FOR SELECT TO authenticated
  USING (get_user_role() = 'ADMIN' OR consultor_id = get_user_id());
CREATE POLICY "clientes_insert" ON clientes FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'GERENTE'));
CREATE POLICY "clientes_update" ON clientes FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN' OR (get_user_role() = 'GERENTE' AND consultor_id = get_user_id()));
CREATE POLICY "clientes_delete" ON clientes FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN' OR (get_user_role() = 'GERENTE' AND consultor_id = get_user_id()));

-- produtos: todos autenticados veem; ADMIN/GERENTE gerenciam
CREATE POLICY "produtos_select" ON produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "produtos_insert" ON produtos FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('ADMIN', 'GERENTE'));
CREATE POLICY "produtos_update" ON produtos FOR UPDATE TO authenticated USING (get_user_role() IN ('ADMIN', 'GERENTE'));

-- contratos
CREATE POLICY "contratos_select" ON contratos FOR SELECT TO authenticated
  USING (
    get_user_role() = 'ADMIN'
    OR EXISTS (
      SELECT 1 FROM clientes WHERE clientes.id = contratos.cliente_id
      AND clientes.consultor_id = get_user_id()
    )
  );
CREATE POLICY "contratos_insert" ON contratos FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'GERENTE'));
CREATE POLICY "contratos_update" ON contratos FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENTE'));

-- agendamentos
CREATE POLICY "agendamentos_select" ON agendamentos FOR SELECT TO authenticated
  USING (get_user_role() = 'ADMIN' OR consultor_id = get_user_id());
CREATE POLICY "agendamentos_insert" ON agendamentos FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'GERENTE') OR consultor_id = get_user_id());
CREATE POLICY "agendamentos_update" ON agendamentos FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN' OR consultor_id = get_user_id());

-- servicos
CREATE POLICY "servicos_select" ON servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "servicos_insert" ON servicos FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('ADMIN', 'GERENTE'));
CREATE POLICY "servicos_update" ON servicos FOR UPDATE TO authenticated USING (get_user_role() IN ('ADMIN', 'GERENTE'));

-- log_notificacoes: apenas ADMIN
CREATE POLICY "log_select" ON log_notificacoes FOR SELECT TO authenticated USING (get_user_role() = 'ADMIN');
CREATE POLICY "log_insert" ON log_notificacoes FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- Seed data (opcional)
-- ============================================================

INSERT INTO servicos (nome, descricao, duracao_min) VALUES
  ('Consultoria Inicial', 'Análise profunda do perfil de investidor, objetivos de longo prazo e diagnóstico patrimonial completo.', 60),
  ('Revisão de Carteira', 'Ajuste periódico de ativos, rebalanceamento de setores e revisão de performance da carteira.', 45),
  ('Setup de Ações', 'Definição de pontos de entrada, saída e stop-loss para operações estruturadas em renda variável.', 30),
  ('Planejamento Sucessório', 'Estruturação de holding familiar e mecanismos de transferência de patrimônio para herdeiros.', 90);

INSERT INTO produtos (nome, descricao, tipo_aplicacao, rentabilidade_anual, prazo_minimo_dias, valor_minimo, ativo) VALUES
  ('CDB Prefixado Premium 2026', 'CDB com taxa prefixada superior à média de mercado.', 'Renda Fixa', 13.5, 365, 10000, true),
  ('LCA Pós-Fixada', 'Letra de Crédito do Agronegócio atrelada ao CDI, isenta de IR.', 'Renda Fixa', 12.5, 90, 5000, true),
  ('Vinci Logística FII (VILG11)', 'Fundo imobiliário com portfólio de galpões logísticos de alto padrão.', 'Fundo Imobiliário', null, null, 1000, true),
  ('Tesouro IPCA+ 2045', 'Título público com proteção contra inflação e rentabilidade real garantida.', 'Tesouro Direto', null, null, 100, true),
  ('Bitcoin Spot ETF (IBIT)', 'ETF de Bitcoin aprovado pela SEC com custódia institucional.', 'Criptoativos', null, null, 500, true);
