# ADVOCAC — Plataforma Digital

Sistema completo para escritório de advocacia especializado em CACs (Caçadores, Atiradores e Colecionadores).

**Stack:** Next.js 14 (App Router) · Supabase (memória do chatbot) · Groq (IA do atendimento) · Tailwind · Vercel

## Início rápido

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Sem variáveis configuradas o site funciona 100% (chat local, sem IA/banco). Com as chaves, ativa Supabase + Groq automaticamente.

## Deploy completo

Guia passo a passo: **`docs/DEPLOYMENT.md`** (Supabase + Groq + Vercel em ~30 min).

## Estrutura

```
advocac-site/
├── apps/web/            Site Next.js (páginas, APIs serverless, motor do chat)
├── supabase/            Migrations (schema + RLS) e seed do conhecimento
├── docs/                SKILL-INDEX · CONTENT-MAP · DEPLOYMENT · RELATORIO-SESSAO
└── package.json         Monorepo (turbo)
```

## Motor de atendimento

```
INPUT → SAFETY (recusas/urgência) → CLASSIFIER (14 tópicos)
      → RETRIEVER (Supabase → fallback local) → GROQ (opcional)
      → VALIDATOR (bloqueia promessa de resultado)
      → ANSWER | CLARIFY | ESCALATE | REFUSE | HANDOFF (WhatsApp)
```

Regras não negociáveis: nunca inventar legislação · nunca prometer resultado ·
sempre fonte + data de verificação · escopo jurídico/documental/administrativo ·
urgência → encaminhamento humano.

## Documentação do projeto

- `../ETAPAS-DESENVOLVIMENTO.md` — roadmap e status das etapas
- `docs/RELATORIO-SESSAO.md` — o que foi feito, o que falta
- `docs/CONTENT-MAP.md` — inventário do conteúdo do Instagram
- `../RELATORIO-PROJETO.md` — diagnóstico da marca e design system
