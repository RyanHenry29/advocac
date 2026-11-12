-- ============================================================
-- ADVOCAC — 002: TABELAS DE CONVERSA E LEADS
-- ============================================================

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
