-- ============================================================
-- BAIRRO360 - SCHEMA DO BANCO DE DADOS (MVP v0)
-- Para rodar no Supabase (PostgreSQL)
-- ============================================================
-- Como usar: cole este arquivo inteiro no SQL Editor do seu
-- projeto Supabase e clique em "Run".
-- ============================================================

-- Extensão necessária para gerar UUIDs automaticamente
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. BAIRROS
-- Cada bairro é uma "comunidade" isolada dentro da plataforma.
-- ------------------------------------------------------------
create table bairros (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cidade text not null,
  estado text not null,
  cep_inicial text,
  cep_final text,
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. PERFIS (extensão da tabela auth.users do Supabase)
-- O Supabase já cuida de login/senha/e-mail na tabela auth.users.
-- Aqui guardamos os dados extras de cada pessoa.
-- ------------------------------------------------------------
create type tipo_perfil as enum ('morador', 'moderador', 'gestor', 'administrador');

create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  telefone text,
  tipo tipo_perfil not null default 'morador',
  bairro_id uuid references bairros(id),
  endereco_rua text,
  foto_url text,
  reputacao_pontos integer default 0,
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- 3. OCORRÊNCIAS
-- O coração do MVP: feed de ocorrências do bairro.
-- ------------------------------------------------------------
create type categoria_ocorrencia as enum (
  'seguranca', 'barulho', 'animais', 'zeladoria',
  'transito', 'achados_perdidos', 'outros'
);

create type status_ocorrencia as enum (
  'aberta', 'em_andamento', 'resolvida', 'encerrada'
);

create table ocorrencias (
  id uuid primary key default uuid_generate_v4(),
  bairro_id uuid not null references bairros(id),
  autor_id uuid not null references perfis(id),
  categoria categoria_ocorrencia not null,
  titulo text not null,
  descricao text not null,
  status status_ocorrencia default 'aberta',
  latitude double precision,
  longitude double precision,
  endereco_referencia text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Anexos (fotos) de uma ocorrência
create table ocorrencia_anexos (
  id uuid primary key default uuid_generate_v4(),
  ocorrencia_id uuid not null references ocorrencias(id) on delete cascade,
  url text not null,
  criado_em timestamptz default now()
);

-- Comentários em uma ocorrência
create table ocorrencia_comentarios (
  id uuid primary key default uuid_generate_v4(),
  ocorrencia_id uuid not null references ocorrencias(id) on delete cascade,
  autor_id uuid not null references perfis(id),
  texto text not null,
  criado_em timestamptz default now()
);

-- Confirmações comunitárias ("isso também aconteceu comigo / confirmo")
create table ocorrencia_confirmacoes (
  id uuid primary key default uuid_generate_v4(),
  ocorrencia_id uuid not null references ocorrencias(id) on delete cascade,
  morador_id uuid not null references perfis(id),
  criado_em timestamptz default now(),
  unique (ocorrencia_id, morador_id) -- cada morador só confirma 1x
);

-- ------------------------------------------------------------
-- 4. GUIA COMERCIAL (empresas e prestadores de serviço)
-- ------------------------------------------------------------
create type categoria_negocio as enum (
  'padaria', 'pizzaria', 'restaurante', 'escola', 'academia',
  'pet_shop', 'clube', 'eletricista', 'encanador', 'jardineiro',
  'pintor', 'seguranca_empresa', 'diarista', 'tecnico', 'outros'
);

create type plano_negocio as enum ('gratuito', 'bronze', 'prata', 'ouro');

create table negocios (
  id uuid primary key default uuid_generate_v4(),
  bairro_id uuid not null references bairros(id),
  dono_id uuid references perfis(id),
  nome text not null,
  categoria categoria_negocio not null,
  descricao text,
  telefone text,
  whatsapp text,
  endereco text,
  latitude double precision,
  longitude double precision,
  foto_url text,
  plano plano_negocio default 'gratuito',
  telefone_validado boolean default false,
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- ------------------------------------------------------------
-- 5. AVALIAÇÕES
-- Avaliação de moradores sobre negócios/prestadores.
-- ------------------------------------------------------------
create table avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  autor_id uuid not null references perfis(id),
  nota integer not null check (nota between 1 and 5),
  comentario text,
  criado_em timestamptz default now(),
  unique (negocio_id, autor_id) -- 1 avaliação por morador por negócio
);

-- ------------------------------------------------------------
-- ÍNDICES para acelerar as consultas mais comuns
-- ------------------------------------------------------------
create index idx_ocorrencias_bairro on ocorrencias(bairro_id);
create index idx_ocorrencias_categoria on ocorrencias(categoria);
create index idx_negocios_bairro on negocios(bairro_id);
create index idx_negocios_categoria on negocios(categoria);
create index idx_avaliacoes_negocio on avaliacoes(negocio_id);
create index idx_perfis_bairro on perfis(bairro_id);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Regra geral do MVP: qualquer pessoa logada pode ler dados do
-- seu próprio bairro; só o autor edita/exclui o que criou.
-- ------------------------------------------------------------
alter table perfis enable row level security;
alter table ocorrencias enable row level security;
alter table ocorrencia_comentarios enable row level security;
alter table ocorrencia_confirmacoes enable row level security;
alter table negocios enable row level security;
alter table avaliacoes enable row level security;

-- Perfis: qualquer usuário autenticado pode ver perfis do mesmo bairro
create policy "perfis_select" on perfis for select
  using (auth.uid() is not null);

create policy "perfis_update_own" on perfis for update
  using (auth.uid() = id);

-- Ocorrências: leitura liberada para autenticados, escrita só para o autor
create policy "ocorrencias_select" on ocorrencias for select
  using (auth.uid() is not null);

create policy "ocorrencias_insert" on ocorrencias for insert
  with check (auth.uid() = autor_id);

create policy "ocorrencias_update_own" on ocorrencias for update
  using (auth.uid() = autor_id);

-- Comentários
create policy "comentarios_select" on ocorrencia_comentarios for select
  using (auth.uid() is not null);

create policy "comentarios_insert" on ocorrencia_comentarios for insert
  with check (auth.uid() = autor_id);

-- Confirmações
create policy "confirmacoes_select" on ocorrencia_confirmacoes for select
  using (auth.uid() is not null);

create policy "confirmacoes_insert" on ocorrencia_confirmacoes for insert
  with check (auth.uid() = morador_id);

-- Negócios: leitura pública para autenticados, escrita só para o dono
create policy "negocios_select" on negocios for select
  using (auth.uid() is not null);

create policy "negocios_insert" on negocios for insert
  with check (auth.uid() = dono_id);

create policy "negocios_update_own" on negocios for update
  using (auth.uid() = dono_id);

-- Avaliações: leitura pública, escrita só pelo próprio autor
create policy "avaliacoes_select" on avaliacoes for select
  using (auth.uid() is not null);

create policy "avaliacoes_insert" on avaliacoes for insert
  with check (auth.uid() = autor_id);

-- ------------------------------------------------------------
-- DADOS DE EXEMPLO (opcional, para testar)
-- Comente/remova esta seção antes de ir para produção real.
-- ------------------------------------------------------------
insert into bairros (nome, cidade, estado) values
  ('Jardim das Flores', 'São Paulo', 'SP'),
  ('Vila Esperança', 'São Paulo', 'SP');
