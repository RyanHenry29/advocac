# DEPLOYMENT — Advocac na Vercel + Supabase + Groq

Guia passo a passo (30–45 min). Nada de código: só contas, cliques e colar chaves.

---

## 1. Supabase (memória do chatbot) — ~15 min

1. Acesse **supabase.com** → crie conta grátis → **New project**
   - Name: `advocac` · Senha do banco: gere forte e guarde · Região: `South America (São Paulo)`
2. Aguardar o projeto ficar **Active**
3. No menu lateral: **SQL Editor** → **New query**
   - Cole TODO o conteúdo de `supabase/migrations/001_create_knowledge_tables.sql` → **Run**
   - Repita com `002_create_conversation_tables.sql` → **Run**
   - Repita com `003_create_rls_policies.sql` → **Run**
4. Ainda no SQL Editor: cole TODO o `supabase/seed/seed.sql` → **Run**
   - Confira: `select count(*) from legal_topics;` deve retornar **15**
5. Pegue as chaves: **Project Settings → API**
   - `Project URL` → será o `SUPABASE_URL`
   - `service_role` secret → será o `SUPABASE_SERVICE_ROLE_KEY` (**nunca** use a anon key aqui; **nunca** exponha essa chave)

> Se `create extension vector` falhar: Settings → Database → Extensions → habilite `vector` e rode a migration 001 de novo.

---

## 2. Groq (a IA do chat) — ~5 min

1. Acesse **console.groq.com** → crie conta grátis
2. **API Keys → Create API Key** → copie (será o `GROQ_API_KEY`)
3. Modelo padrão já configurado no código: `llama-3.3-70b-versatile` (troque via env `GROQ_MODEL` se quiser)

---

## 3. Vercel (hospedagem + APIs) — ~10 min

1. Suba o repositório para o **GitHub** (pasta `advocac-site/` inteira)
2. **vercel.com** → Add New → **Project** → importe o repositório
3. Configure:
   - **Root Directory:** `apps/web`
   - Framework: Next.js (detecta sozinho)
4. **Environment Variables** (antes do primeiro deploy) — adicione:

| Nome | Valor | Onde pegar |
|---|---|---|
| `SUPABASE_URL` | https://xxxx.supabase.co | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... (service_role) | Supabase → Settings → API |
| `GROQ_API_KEY` | gsk_... | console.groq.com |
| `NEXT_PUBLIC_WHATSAPP` | 5511932290927 | fixo |
| `NEXT_PUBLIC_EMAIL` | contato@advocac.com.br | fixo |
| `NEXT_PUBLIC_LAWYER_NAME` | nome do titular | fixo (aparece no rodapé) |
| `NEXT_PUBLIC_OAB` | OAB/UF 000.000 | fixo (aparece no rodapé) |
| `NEXT_PUBLIC_CNPJ` | 00.000.000/0000-00 | opcional — fica vazio no rodapé se ausente |

> `NEXT_PUBLIC_SITE_URL` **não coloque ainda** — a Vercel detecta a URL automática sozinha. Só configure quando comprar o domínio (passo 5).

5. **Deploy** → aguardar (~2 min)

---

## 4. Validação pós-deploy — ~5 min

Abra no navegador:
- `https://SEU-PROJETO.vercel.app/api/health`
  - Esperado: `{"status":"ok","db":"ok","llm":"groq",...}`
  - `db: unconfigured` → env var do Supabase errada
  - `llm: local` → env var do Groq ausente (site funciona igual, sem IA)
- Site: teste o chat ("meu CRAF está vencendo") → deve responder com fonte e data
- No Supabase → **Table Editor → conversation_sessions**: a conversa deve aparecer registrada

---

## 5. Domínio próprio (quando comprar `advocac.com.br`)

1. Vercel → Project → **Settings → Domains → Add** → `advocac.com.br` (+ `www`)
2. No registrador do domínio, crie os registros DNS que a Vercel mostrar (A/CNAME)
3. Vercel → **Environment Variables** → adicione `NEXT_PUBLIC_SITE_URL` = `https://www.advocac.com.br` → **Redeploy**
4. Pronto: canonical, sitemap, robots e OG atualizam sozinhos
5. Google Search Console: valide o domínio → envie `https://www.advocac.com.br/sitemap.xml`

---

## 6. Medições e verificação (opcional, depois do domínio)

Nada disto é obrigatório para o site funcionar. Sem as envs, nenhum script de
medição é gerado — a página não pede GA4/GTM ao navegador.

### Google Search Console (obrigatório para SEO)
1. [search.google.com/search-console](https://search.google.com/search-console) → **Add property** → domínio
2. Use o método **HTML tag** → copie o valor → Vercel env `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` → Redeploy
3. Em **Sitemaps** → envie `https://www.advocac.com.br/sitemap.xml`

### Google Analytics 4
1. [analytics.google.com](https://analytics.google.com) → Admin → **Create property** → web
2. Copie o ID `G-XXXXXXXXXX` → env `NEXT_PUBLIC_GA4_ID` → Redeploy
3. GA4 só carrega se o visitante aceitar "Analytics" no banner de cookies

### Google Tag Manager (opcional — se for usar para mais tags)
1. [tagmanager.google.com](https://tagmanager.google.com) → crie o container web
2. Copie o ID `GTM-XXXXXXX` → env `NEXT_PUBLIC_GTM_ID` → Redeploy

### Bing Webmaster
1. [bing.com/webmasters](https://bing.com/webmasters) → adicione o site → verificação por **HTML meta tag**
2. Copie o valor → env `NEXT_PUBLIC_BING_VERIFICATION` → Redeploy
3. Importe o sitemap do GSC (Bing oferece essa opção)

### Google Meu Negócio (busca local)
1. [business.google.com](https://business.google.com) → criar perfil "Advocac"
2. Categoria: **Advogado** · área de atendimento: Brasil (ou estados de atuação)
3. Preencha WhatsApp, Instagram e o site. Sem endereço físico, use "atendimento nos locais do cliente"

---

## Custos mensais estimados

| Serviço | Plano | Custo |
|---|---|---|
| Vercel | Hobby | R$ 0 |
| Supabase | Free (500MB, 2 projetos) | R$ 0 |
| Groq | Free tier (limites por minuto) | R$ 0 |
| Domínio .com.br | anual | ~R$ 40/ano |
| **Total** | | **~R$ 0/mês** |

> Limites do free tier: Groq tem cota por minuto/dia (suficiente para início); se o chat crescer muito, o fallback local mantém o site funcionando mesmo estourando cota.

---

## Troubleshooting rápido

| Sintoma | Causa provável |
|---|---|
| `db: unconfigured` no health | Env vars ausentes/mal coladas → confira e **Redeploy** |
| Chat responde sem fonte/data | KB veio do fallback local → rode o seed no Supabase |
| Chat não melhora com IA | `GROQ_API_KEY` ausente ou inválida |
| Erro `relation "legal_topics" does not exist` | Migrations não rodaram → passo 1.3 |
| 429 no chat | Rate limit (20 msg/min por IP) — normal, aguardar |
