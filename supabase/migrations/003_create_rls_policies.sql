-- ============================================================
-- ADVOCAC — 003: RLS (SEGURANÇA POR CAMADA)
-- Camada pública (anon): lê conhecimento ativo; insere conversas/leads.
-- Escrita administrativa: apenas via service role (API serverless).
-- ============================================================

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

-- Sem policies de select/update/delete para anon:
-- negado por padrão com RLS habilitado. Admin usa service role via API.
