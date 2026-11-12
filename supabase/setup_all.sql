-- ============================================================
-- ADVOCAC — SETUP COMPLETO (colar no SQL Editor do Supabase)
-- ============================================================

-- 001: TABELAS DE CONHECIMENTO

create extension if not exists vector;

create table if not exists knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null default 'GOVERNMENT',
  authority_level text not null default 'OFFICIAL',
  url text,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source_id uuid references knowledge_sources(id),
  source_label text,
  jurisdiction text default 'BR',
  authority_level text not null default 'OFFICIAL',
  status text not null default 'active',
  valid_from date,
  valid_until date,
  last_verified_at date,
  verified_by text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references knowledge_documents(id) on delete cascade,
  content text not null,
  chunk_index integer not null default 0,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legal_topics (
  id text primary key,
  label text not null,
  patterns jsonb not null default '[]',
  clarify text not null default '',
  answer text not null,
  steps jsonb,
  docs jsonb,
  source_label text,
  source_verified text,
  direct_handoff boolean not null default false,
  escalate_hint boolean not null default false,
  urgent_if_expired boolean not null default false,
  active boolean not null default true,
  valid_from date,
  valid_until date,
  last_verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists regulated_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  current_system text,
  current_status text not null default 'active',
  official_source text,
  official_url text,
  last_verified_at date,
  next_review_at date,
  active boolean not null default true
);

create table if not exists assistant_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  instruction text not null,
  priority integer not null default 50,
  scope text default 'global',
  severity text not null default 'medium',
  active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists faq_entries (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  topic_id text references legal_topics(id),
  status text not null default 'published',
  valid_until date,
  created_at timestamptz not null default now()
);

create table if not exists unknown_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  session_id uuid,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_legal_topics_active on legal_topics(active);
create index if not exists idx_documents_status on knowledge_documents(status);
create index if not exists idx_chunks_document on knowledge_chunks(document_id);
create index if not exists idx_unknown_unresolved on unknown_questions(resolved);

-- 002: TABELAS DE CONVERSA E LEADS

create table if not exists conversation_sessions (
  id uuid primary key,
  status text not null default 'active',
  intent text,
  urgency text not null default 'low',
  lead_score integer not null default 0,
  human_required boolean not null default false,
  profile text,
  kb_origin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references conversation_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  state text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists human_escalations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references conversation_sessions(id),
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references conversation_sessions(id),
  name text,
  whatsapp text,
  email text,
  subject text,
  profile text,
  status text not null default 'new',
  score integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  event text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_status on conversation_sessions(status);
create index if not exists idx_messages_session on conversation_messages(session_id);
create index if not exists idx_leads_status on leads(status);

-- 003: RLS

alter table knowledge_sources enable row level security;
alter table knowledge_documents enable row level security;
alter table knowledge_chunks enable row level security;
alter table legal_topics enable row level security;
alter table regulated_services enable row level security;
alter table assistant_rules enable row level security;
alter table faq_entries enable row level security;
alter table unknown_questions enable row level security;
alter table conversation_sessions enable row level security;
alter table conversation_messages enable row level security;
alter table human_escalations enable row level security;
alter table leads enable row level security;
alter table lead_events enable row level security;
alter table audit_logs enable row level security;

create policy "publico_le_topicos_ativos"
  on legal_topics for select to anon, authenticated
  using (active = true);

create policy "publico_le_faq_publicada"
  on faq_entries for select to anon, authenticated
  using (status = 'published');

create policy "publico_le_servicos_ativos"
  on regulated_services for select to anon, authenticated
  using (active = true);

create policy "publico_insere_sessao"
  on conversation_sessions for insert to anon, authenticated
  with check (true);

create policy "publico_insere_mensagem"
  on conversation_messages for insert to anon, authenticated
  with check (true);

create policy "publico_insere_pergunta_desconhecida"
  on unknown_questions for insert to anon, authenticated
  with check (true);

create policy "publico_insere_lead"
  on leads for insert to anon, authenticated
  with check (true);
