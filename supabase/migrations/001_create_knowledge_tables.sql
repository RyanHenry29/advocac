-- ============================================================
-- ADVOCAC — 001: TABELAS DE CONHECIMENTO (ETAPA 3)
-- ============================================================

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
