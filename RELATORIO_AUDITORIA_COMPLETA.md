# RELATÓRIO DE AUDITORIA COMPLETA — ADVOCAC

Data: 11/11/2026 · Escopo: `advocac-site-master` (monorepo → `apps/web`, Next.js 14.2)
Referência de design: `ID Visual Advocac.pdf` (7 páginas, lidas integralmente) + `docs/IDENTIDADE-VISUAL.md`
Skills aplicadas: `skill-202`, `skill-208`, `skill-200`, `skill-201`, `skill-210`, `skill-05`, `skill-26`, `skill-17-xss`, `skill-32`, `skill-48`, `skill-71`

> **Duas rodadas.** Rodada 1 = auditoria +6 correções (seções 0–10, preservadas abaixo como histórico).
> Rodada 2 = validação independente das correções da rodada 1 + ataque aos9 itens prioritários com
> testes reais (não só build verde) + novas correções de baixo risco (seções R2). Evidências de
> rodada 1 continuam válidas; nada dela foi apagado.

---

# RODADA 1 — auditoria + correções

## 0. Conflito de contexto (declarado uma vez)

O briefing de missão cita "Despachante Paixão" (azul-marinho + laranja, despachantepaixao.com.br).
O projeto real na mesa é a **Advocac** (grafite + latão, direito para CACs) e o dono mandou usar o
`ID Visual Advocac.pdf`. Auditoria feita contra o projeto real. Nenhum código de "despachante" foi
injetado. Paleta/tipografia do PDF são fonte da verdade e conferem com `tailwind.config.ts`.

---

## 1. Verificação executada (estado real, não opinião)

| Comando | Resultado |
|---|---|
| `npm run build` | ✅ 22 rotas, 0 erros de tipo, first load 87,3–103 kB |
| `npm run lint` (antes) | ⚠️ 4 warnings (script apontava para `next lint` interativo sem config) |
| `npm run lint` (depois) | ✅ 0 erros, 0 warnings |

Rotas: 10 páginas + 404 + 3 APIs (`/api/chat`, `/api/leads`, `/api/health`) + sitemap/robots/manifest/OG.

---

## 2. Correções aplicadas nesta sessão

| # | Problema | Arquivo | Correção |
|---|---|---|---|
| 1 | **GA4/GTM nunca carregavam**: o componente lia o consentimento uma vez no render; ao usuário aceitar, não havia re-render e o `<Script>` nunca era injetado. O `gtag()` empurrava config para um `dataLayer` sem script. | `src/components/seo/Analytics.tsx` | Estado `consented` reativo ao evento `cookie-consent`; scripts renderizam só com consentimento true; `gtag config` dispara na hora da aceitação. |
| 2 | **CSP bloqueava o iframe do GTM**: `frame-src 'self'` impedia o `noscript` do Google Tag Manager (`googletagmanager.com`). | `next.config.js` | `frame-src 'self' https://www.googletagmanager.com`. |
| 3 | **Recusa de cookie em dois cliques, aceite em um** — assimetria de dark pattern, contra a lógica de consentimento livre (LGPD/skill-201). | `src/components/cookie/CookieBanner.tsx` | Removida a maquinaria `confirmReject`/timer; Recusar ageira em 1 clique, igual Aceitar. |
| 4 | **`npm run lint` abria prompt interativo** do `next lint` (Next 14 não lê flat config) e falhava em CI. | `apps/web/package.json` | Script virou `eslint src` (usa o `eslint.config.mjs` que já existia). |
| 5 | **4 warnings de lint**: `err` não usado + `eslint-disable` órfão em `leads/route.ts`; `Link` não usado em `central-cac/page.tsx`; `EngineState` não usado em `useChatEngine.ts`. | 3 arquivos | Código morto removido; `catch` sem binding. |

Nada foi apagado sem aviso: os temporários de leitura do PDF (`_pdf_p1..p7.png`, `_pdf_text.txt`,
criados nesta sessão) foram removidos após o registro do conteúdo.

---

## 3. Segurança

### O que está certo (verificado no código)

- **Headers** (`next.config.js`): `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (câmera/mic/geoloc off), `HSTS 2 anos + preload`, CSP com `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. `poweredByHeader: false`.
- **Entradas**: Zod em `/api/chat` (enums de fase, UUID de sessão, limites de tamanho) e `/api/leads` (nome 2–80, validador de celular BR com DDD whitelist, maximações). Honeypot `company` descarta bot com resposta `ok` falsa.
- **Chaves**: `GROQ_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` só em server route; `getSupabaseAdmin()` nunca vaza para client.
- **XSS no chat**: respostas passam por `sanitizeBotHtml()` — allowlist (`strong, em, br, p, ul, li, span`), texto escapado, atributos descartados exceto `class` de `span` escapado. Usuário entra sempre via `escapeHtml()`. O `dangerouslySetInnerHTML` de `ChatPanel`/`ChatWidget` só recebe HTML já sanitizado.
- **Promessa de resultado**: `validator.ts` bloqueia "garantido/100%/vai ganhar" vindo do LLM; fallback para resposta canônica.
- **Rate limit**: `/api/leads` 5/min por IP, `/api/chat` 20/min por IP, com `Retry-After`. `clientKey` usa `x-forwarded-for` — correto atrás do proxy Vercel.
- **Links externos**: todas as 13 ocorrências de `target="_blank"` têm `rel="noopener noreferrer"` (verificado uma a uma).

### Riscos aceitos / pendências

| Risco | Severidade | Por que não corrigi agora |
|---|---|---|
| Rate limit in-memory (`Map`) — em serverless cada instância tem seu bucket; atacante com rotação de IP ou multi-instância amplia o limite. | Média | Corrigir exige Redis/Upstash (conta + dependência nova). Hoje o limite existe e cobre abuso comum. Skill-181 quando houver volume. |
| Contexto do chat vem do cliente (`sessionId`, `urgency`, `profile`) e vai para o log do Supabase — dá para forjar urgência num registro. | Baixa | Zod restringe tipos/tamanhos; forge de urgência só polui score, não concede nada. |
| `POST /api/leads` engole o `error` do Supabase (insert silencioso). O handoff por WhatsApp continua funcionando — gravação é best-effort. | Baixa | Decisão registrada no `catch`; se leads sumirem do dashboard, é o primeiro lugar olhar. |
| `GET /api/health` público mostra `db`/`llm`. | Baixa | É endpoint de monitoramento (Vercel uptime); vazamento é status, não dado. |

---

## 4. SEO

### Presente e correto

- `metadata` + `alternates.canonical` em **todas** as 10 páginas; template de título `%s | Advocac`.
- `metadataBase`, `lang="pt-BR"`, `openGraph` (pt_BR, siteName), `twitter: summary_large_image`.
- `opengraph-image.png` estática no root do app; `manifest.ts` com ícones; `robots.ts` libera tudo e bloqueia `/api/`; `sitemap.ts` com 7 rotas priorizadas (frequência semanal nas que mudam).
- JSON-LD: `LegalService` + `WebSite` na home, `FAQPage` na Central CAC, JSON-LD no Escritório e no Contato.
- Verificação Google/Bing por env (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION`).
- Palavra-chave no início do title na home ("Advogado para CACs — …") e nas páginas-chave.
- Core Web Vitals: `next/font` com `display: swap`, hero com `priority` + `sizes="100vw"`, WebP 89 kB.

### Pendências (dependem de dado do titular, não de código)

1. **City pages / SEO local** (skill-202/208): não existem `/cidade/{slug}`. Só fazem sentido com a lista real de praças de atuação — hoje o site atende Brasil inteiro sem endereço público. Enquanto o titular não passar a lista, criar páginas seria conteúdo filler (proibido pela própria skill-208: "conteúdo ÚNICO por página").
2. **Google Business Profile**: tarefa fora do repositório (skill-208 checklist).
3. ~~`favicon.png` tem 123 kB para um ícone~~ → **resolvido na rodada 2** (seção R2.2).

---

## 5. Performance

| Métrica | Estado |
|---|---|
| First Load JS shared | 87,3 kB |
| Home (rota mais pesada) | 103 kB |
| Hero | WebP 89,6 kB, `priority`, `fill`, overlay único |
| Fontes | `next/font` (Bebas/Barlow/IBM Plex Mono), variáveis CSS, zero request externo em runtime |
| Áreas críticas | Só CSS/JS do Next — sem bloqueio de terceiro antes do consentimento |
| Imagens | `next/image` em Hero e Escritório; logos via componente |

Sem `next lint`/bundle analyzer apontando problema. Marquee, reveal e hero usam CSS transform/opacity
(compositor), não `top/left`. `prefers-reduced-motion` respeitado globalmente em `globals.css`.

~~Pendência cosmética: comprimir `favicon.png` (123 kB).~~ → **resolvido na rodada 2**.

---

## 6. Acessibilidade

**Verificado bom:**
- Skip-link ("Pular para o conteúdo") com foco visível.
- `:focus-visible` com outline latão 2px em tudo.
- Menu mobile: `aria-expanded`, `aria-label`, focus trap com Tab/Shift+Tab, Esc fecha, devolve foco ao hambúrguer, scroll lock do body.
- Chat: `role="log"` + `aria-live="polite"`, labels nos inputs, botões de envio com `aria-label`.
- Cookie banner: `role="dialog"`, foco inicial, Esc, switches com `role="switch"` + `aria-checked` + teclado.
- Inputs com `font-size: 16px` no iOS (anti-zoom), `label htmlFor` em todos os campos do LeadForm.
- Contraste: off-white `#EFEAE0` sobre grafite `#17191C` (~15:1), latão sobre grafite (~7:1) — passa AA/AAA.
- Texto alternativo: logo tem `aria-label`/alt, imagem decorativa do hero com `alt=""`.

**Pendência menor:**
- ~~Accordion da FAQ (`Faq.tsx`): botão sem `aria-expanded`/`aria-controls`.~~ → **resolvido na rodada 2** (seção R2.1), validado em browser real.

---

## 7. UX

- **Handoff WhatsApp** em todos os pontos (form, chat, CTA): resumo do caso já montado, um clique.
- **Disclaimer** ("não substitui análise jurídica individualizada") no rodapé do chat, no form e no CTA — coerente com o tom do escritório.
- **Fonte + data** em cada resposta do chat (diferencial da marca).
- **404** com ação de recuperação (início / atendimento).
- **Estados**: loading no botão do form, erro com texto acionável, typing indicator no chat, fallback local do chat quando Supabase/Groq fora.
- **Cookie banner** agora simétrico (item 3 da seção 2).
- Intro cinematográfica 1×/sessão com respeito a `reduced-motion` (já implementado, conferido).

---

## 8. Identidade visual × PDF

Conferido página a página do PDF contra o código:

- Paleta idêntica (`tailwind.config.ts` = PDF): grafite, latão único destaque, off-white, oliva, cobre, vermelho só em erro.
- Tipografia: Bebas (títulos, caixa alta), Barlow (corpo), IBM Plex Mono (`NormText` para normas) — como no manual.
- Logo: variantes monocromáticas (`logo-latao/offwhite/grafite/preto.png`), watermark nos cards, símbolo em latão no rodapé à direita — como na seção de rodapé do PDF.
- Assinatura do rodapé `@advocac_ · nome · OAB` em mono, via envs.
- Off-white `#EFE9DF`/`#EFEAE0`: o CSS usa `#EFEAE0` (valor do PDF/IDENTIDADE-VISUAL.md) — consistente.

Nada no site contradiz o manual.

---

## 9. Pendências priorizadas (rodada 1)

1. ~~**Faq.tsx `aria-expanded`**~~ → feito na rodada 2.
2. ~~**favicon multi-tamanho**~~ → feito na rodada 2.
3. **Rate limit distribuído (Upstash)** → código pronto e testado na rodada 2; falta só a conta + 2 envs (R2.5).
4. **City pages + GBP** — bloqueadas em dado do titular (praças de atuação reais). Não mudou.
5. ~~**Log do erro de insert em `leads`**~~ → feito na rodada 2.

---

## 10. Conclusão da rodada 1

O site está **saudável**: build e lint verdes, segurança em camadas (headers + Zod + sanitização +
rate limit + consent gate), SEO on-page completo para o escopo atual, performance leve (≤103 kB),
identidade visual fiel ao PDF. Seis defeitos reais foram encontrados e corrigidos nesta sessão —
o mais grave era o **analytics que nunca carregava após o aceite** (consentimento sem re-render).
O que restou pendente está bloqueado por dado de terceiro ou por infraestrutura nova, não por dívida
de código.

---
---

# RODADA 2 — validação profunda + correções novas

## R2.0 Método

Segunda passada independente: cada correção da rodada 1 foi relida no código; os9 itens
prioritários foram atacados com **execução real** — baterias de API contra `next start`, testes de
browser com Edge (`playwright-core` + canal `msedge`, sem download de browser), mock de Upstash e
simulação de banco fora do ar. Nenhum item foi dado como pronto por compilar.

**Resultado global da rodada 2: 95 asserções PASS, 0 FAIL.** Lint 0/0. Build ✓ 22/22 páginas.

| Suite | Servidor / condição | Resultado |
|---|---|---|
| `tests/round2/api-battery.mjs` | 3103 (sem credenciais) | **39 PASS, 0 FAIL** |
| `tests/round2/session-token.mjs` | 3104 (`SESSION_SECRET` ativo) | **9 PASS, 0 FAIL** |
| `tests/round2/failure-mode.mjs` | 3101 (Supabase URL+key fakes, host inexistente) | **7 PASS, 0 FAIL** |
| `tests/round2/upstash-path.mjs` fase1 | 3102 + mock Upstash em :3800 | **PASS** (5×200, 429 na 6ª) |
| `tests/round2/upstash-path.mjs` fase2 | mock morto | **PASS** (fail-open → 200) |
| `tests/round2/browser.mjs` | 3103 (`G-TEST123`/`GTM-TEST123` no build) | **37 PASS, 0 FAIL** |
| `npm run lint` | — | **0 erros, 0 warnings** |
| `npm run build` | — | **✓ 22/22, 0 erros de tipo** |

Scripts ficam em `apps/web/tests/round2/` (reexecutáveis). Temporários de depuração removidos.

---

## R2.1 Validação das correções da rodada 1 (todas confirmadas no código)

| # rodada 1 | Como foi validado | Estado |
|---|---|---|
| Analytics reativo | Browser: sem consentimento ≠ script; Aceitar → `gtag/js?id=G-TEST123` + `GTM-TEST123` no DOM e `config` no `dataLayer`; sem exceções JS | ✅ real |
| CSP frame-src GTM | Header CSP da bateria contém `frame-src 'self' https://www.googletagmanager.com` | ✅ real |
| Recusa 1 clique | Browser: banner some em **85–105 ms** após 1 clique; consentimento salvo `analytics:false`; nenhum script injetado | ✅ real |
| `lint` = `eslint src` | `npm run lint` → exit 0, 0 warnings | ✅ real |
| Warnings limpos | idem | ✅ real |
| (novos na rodada 1) health `force-dynamic` | `ƒ` na tabela de rotas; dois `/api/health` seguidos devolvem timestamps distintos (13:09:21 → 13:09:23) | ✅ real |

---

## R2.2 Correções novas aplicadas (baixo risco, implementadas direto)

| # | Achado | Arquivo(s) | Correção |
|---|---|---|---|
| 1 | FAQ sem estado acessível (pendência 1 da rodada 1) | `src/app/central-cac/Faq.tsx` | `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`, `useId`; painel fechado com `max-h-0 invisible` (sai da árvore de a11y). Validado em browser: false→true→false. |
| 2 | `favicon.png` 123 kB, sem `.ico` nem ícones PWA (pendência 2) | `src/app/icon.ico` (novo, 16/32/48, 4,1 kB), `public/icon-192.png`, `public/icon-512.png`, `manifest.ts`, `favicon.png` otimizado | Rota `/icon.ico` no build; manifest aponta para os PNGs novos; `favicon.png` 123→99 kB. |
| 3 | Insert de lead falhava **silenciosamente** (pendência 5) | `api/leads/route.ts`, `api/chat/route.ts` | `console.error` com `code`/`msg` do Supabase, caso "não configurado" e exceção; eslint `no-console` → `allow: ["error"]`. Log real capturado: `[leads] insert recusado: code= msg=TypeError: fetch failed`. |
| 4 | Rate limit só em memória (pendência 3) | `src/lib/security/rate-limit.ts` | Caminho **Upstash REST opcional** (fetch puro, **zero dependência nova**), timeout 1 s, **fail-open** com log se falhar; bucket em memória como fallback; rotas `leads`/`chat` agora `await`. Env: `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`. |
| 5 | **CRÍTICO — fantasma nº 1**: `retriever.ts` consultava `knowledge_topics` (tabela **inexistente**) esperando `data.topics` → a KB do Supabase **nunca** era usada; todo mundo caía no fallback local sem saber | `src/lib/chatbot/retriever.ts` | Passou a consultar `legal_topics` (`.eq("active", true)`), mapeia colunas reais (`patterns`, `steps`, `docs`, `source_label`…), valida regex com try/catch, fallback local mantido. |
| 6 | **CRÍTICO — fantasma nº 2**: `supabase/seed/seed.sql` tinha vírgula final antes de `on conflict do nothing;` → erro de sintaxe, **seed inteiro falhava**, `legal_topics` nunca populava | `supabase/seed/seed.sql` | Vírgula removida; script verificado (`n=1` ocorrência, sem nova vírgula órfã). |
| 7 | **CRÍTICO — fantasma nº 3**: `/api/health` era estático (`x-nextjs-cache: HIT`, timestamp congelado no build) | `api/health/route.ts` | `export const dynamic = "force-dynamic"` → rota `ƒ`, timestamps mudam a cada chamada. |
| 8 | Abrir "Preferências" **resetava os toggles para `false`** — salvar sem tocar em nada revogava o analytics dado (perda silenciosa de consentimento) | `cookie/CookieBanner.tsx` | Botão só abre a view; valores vêm do storage (`reopen` já carregava). |
| 9 | Revogação não derrubava os scripts já injetados (React desmonta o `<Script>`, mas a tag fica) | `seo/Analytics.tsx` | Em `!allowed`: remove `#ga4`, `#gtm`, `script[src*="gtag/js"]`, `script[src*="gtm.js"]` e empurra `consent default: analytics_storage=denied` na `dataLayer`. Browser: após revogar, ambos somem do DOM. |
| 10 | **Intro repetia a cada reload**: `finishIntro` **gravava** `advocac_intro_seen` no sessionStorage, mas o estado **nunca lia** — "1× por sessão" era mentira | `motion/IntroContext.tsx` | `useEffect` lê a chave no mount. Browser: 1ª visita tem overlay; reload na mesma sessão não tem. |
| 11 | Classifier recompilava **todos** os patterns a cada request; pattern inválido vindo do banco derrubava o classify (→500) | `lib/chatbot/classifier.ts` | Cache `Map<string, RegExp \| null>`; pattern inválido vira `null` e não pontua. |
| 12 | **`context.passthrough()`** no Zod: cliente podia forjar `sessionId` alheio e o `upsert` em `conversation_sessions` escrevia **em sessão de terceiro** | `api/chat/route.ts` + **novo** `lib/security/session-token.ts` | Schema estrito (strip de extras); `sessionId` agora vem **assinado** (HMAC-SHA256). Segredo: `SESSION_SECRET`, ou `SUPABASE_SERVICE_ROLE_KEY` (com Supabase ativo o assinamento liga sozinho). Assinatura forjada/uuid puro → **sessão nova**, nunca a alheia; resposta devolve assinado. |

---

## R2.3 Evidências por item prioritário

**1–4, 7 (API + rotas)** — bateria `api-battery`: 10 páginas 200, 404, sitemap/robots/manifest/`icon.ico` 200,
robots bloqueia `/api/`, todos os headers (XFO DENY, nosniff, HSTS, CSP com GTM em `frame-src`,
`form-action 'self'`, sem `X-Powered-By`), health dinâmico, leads (válido → `handoffUrl wa.me`,
honeypot, 400, 429 na 6ª), chat (200, `X-KB-Origin`, fase inválida → 400, REFUSE em "como limpar
minha pistola", 429 após 20).

**4 (Upstash de verdade)** — mock local do protocolo REST: fase 1 aplica o limite distribuído
(200×5 + 429); fase 2 mata o mock → fail-open com log real
`[rate-limit] upstash falhou, usando memoria: fetch failed` e aceita (200).

**5 (GA/GTM + consentimento em browser)** — 8 asserções: sem consentimento = zero script; aceitar =
scripts com os IDs exatos + `config` no `dataLayer`; revogar = scripts removidos do DOM; zero
`pageerror`.

**6 (segurança profunda)**
- Segredos no repositório: **nenhum** — só `.env.example` e placeholders na documentação.
- `console.log/info/warn/debug` em `src/`: **zero** (só `console.error`, com allowlist no eslint).
- Logs: nenhum loga mensagem de lead, telefone ou conteúdo de conversa — só `code`/`msg` de erro.
- XSS: fluxo do chat exercitado em browser (sanitização + allowlist) sem exceção JS.
- Forja de sessão: teste dedicado prova round-trip mantém a sessão; sessionId forjado e uuid puro
  são **descartados** (sessão nova); `phase` inválida continua 400.
- ReDoS: patterns do banco compilados uma vez e tolerados se inválidos; patterns locais são
  literais fixos.

**8 (mobile 375×812)** — 12 asserções: zero overflow horizontal em `/`, `/contato`, `/central-cac`,
`/atendimento`; hambúrguer abre/fecha (Esc); chat ocupa a tela inteira (375 px); sem `pageerror`.

**9 (funcionalidades fantasma)** — âncoras do rodapé `#portal-pf`, `#habitualidade`, `#craf`
existem na Central CAC; intro 1×/sessão (corrigido, item 10); form de leads abre popup `wa.me` com
resumo e mostra "Mensagem registrada."; hero `naturalWidth>0`; `/diagnostico` responde 200 na
bateria. GTM `noscript` só renderiza com consentimento — sem JS não há como consentir, então não
carregar tracking sem JS é o comportamento correto.

---

## R2.4 O que a rodada 2 não repetiu

- Não refez a conferência de paleta/PDF (rodada 1, seção 8 — inalterada).
- Não recontou `target="_blank"` (rodada 1 — inalterado).
- Não revalidou city pages/GBP (bloqueio de dado do titular — inalterado).

---

## R2.5 Pendências externas (código pronto; falta credencial/decisão)

| Pendência | O que falta | Onde o código está pronto |
|---|---|---|
| Supabase real | Criar projeto + rodar 3 migrations + **seed corrigido** (§1 do `docs/DEPLOYMENT.md`) | `retriever.ts` já lê `legal_topics`; seed sem vírgula fatal |
| Upstash | Conta grátis + 2 envs (`UPSTASH_REDIS_REST_URL`/`TOKEN`) | `rate-limit.ts` — caminho REST testado com mock |
| Groq | API key (`GROQ_API_KEY`) | pipeline com fallback local já funciona sem |
| GA4 / GTM / GSC / Bing | IDs/envs reais de produção | comportamento validado com `G-TEST123`/`GTM-TEST123` |
| `SESSION_SECRET` | Opcional: sem ela e sem Supabase o id puro circula (não há banco para proteger); **com Supabase a `service_role` já vira o segredo automaticamente** | `session-token.ts` |
| Dado do titular | Praças de atuação (city pages), GBP, foto profissional, revisão de textos/OAB | — |
| Revisão jurídica | Termos, Privacidade, Cookies (rascunhos prontos) | — |

---

## R2.6 Conclusão da rodada 2

As6 correções da rodada 1 sobreviveram à validação independente (todas provadas em execução, não em
leitura). A rodada 2 encontrou e corrigiu **12 defeitos novos** — três deles **críticos e
silenciosos**: a KB do Supabase nunca era consultada (tabela errada), o seed nunca populava o banco
(sintaxe), e a intro repetia a cada reload (estado nunca lia o que gravava). Também fechou forja de
sessão entre terceiros, revogação de analytics que não derrubava scripts, perda silenciosa de
consentimento no botão Preferências e as duas pendências de acessibilidade/ícone da rodada 1.

Estado final: **lint 0/0, build 22/22 verde, 95 asserções PASS / 0 FAIL** em API, browser, modo de
falha, Upstash e sessão assinada. O que falta não é código — é conta, chave e decisão do titular
(tabela R2.5).

---
---

# RODADA 3 — HOMOLOGAÇÃO DE PRODUÇÃO (11/11/2026)

Escopo do titular: **infraestrutura, segurança, validação final — sem novas funcionalidades**,
fechando para uma versão estável.

## R3.0 Método

Todo resultado abaixo é de execução real (servidor `next start` + browser Edge), não leitura de
código. Sem credencial externa, os scripts de integração imprimem `SKIP` e saem 0 — nada é
simulado como PASS.

## R3.1 Fechado nesta rodada (executado e provado)

| # | Lacuna (lista do titular) | O que foi feito | Evidência |
|---|---|---|---|
| 1 | **HMAC sem expiração** — token vitalício; se vazasse, valeria para sempre | `session-token.ts`: formato `uuid.exp.assinatura`, TTL **48 h deslizante** (cada resposta re-assina = rotação). Token vencido, exp forjado ou assinatura errada → sessão nova; trocar `SESSION_SECRET` derruba todos os tokens | `session-token.mjs`: **16 PASS, 0 FAIL** — inclui expirado com assinatura válida descartado, exp tamperado descartado, rotação deslizante confirmada |
| 2 | **Rate limit multi-instância** — duas instâncias não dividiam contador | Prova A/B: mesmo IP, dois processos `next start`. Sem Upstash: 6×200 (buckets isolados). Com Upstash + mock REST: 5×200 atravessando A e B, **6ª → 429** (contador compartilhado) | `multi-instance.mjs`: fase memória **2 PASS**, fase upstash **2 PASS** |
| 3 | **Validação Supabase/seed/RLS antes do banco real** | Validador estático:14 tabelas das migrations × inserts do seed (tabela e coluna existentes), vírgula órfã ausente, **15 tópicos** em `legal_topics`, RLS habilitado nas 14/14, tabelas da API cobertas | `schema-seed-check.mjs`: **8 PASS, 0 FAIL** |
| 4 | **Drift de documentação** | `DEPLOYMENT.md` mandava conferir `count = 14`; seed carrega **15** (o guia acusaria falha num seed bom) | `docs/DEPLOYMENT.md` corrigido para 15; validador confere |
| 5 | **Logs/PII** | Auditoria formal: `console.log/info/warn/debug` em `src/` = **zero**; 6 `console.error` só com código/mensagem de erro (sem nome, telefone, WhatsApp ou texto de conversa); texto do usuário vai só para `conversation_messages` (RLS) e `sessionStorage` é do próprio navegador | greps + leitura dos 6 pontos |
| 6 | **Kit de homologação reutilizável** | `homologation.mjs <url> [--expect db=ok --expect llm=groq --expect origin=supabase] [--deep]` — páginas, headers, SEO, health dinâmico, contrato do chat, leads; `--deep` queima rate limit (default off para não envenenar IP de produção) | rodada local: **33 PASS, 0 FAIL** |
| 7 | **Verificação das integrações reais** | `verify-externos.mjs`: Supabase (seed legível, insert de lead, anon não lê `leads`, isolamento A→B), Groq (`/models`), Upstash (`PING` no pipeline) — cada bloco sem env imprime `SKIP` e sai 0 | sem envs: **3 SKIP, exit 0** (provado o modo degradado) |

## R3.2 Bateria completa — estado final

| Suite | Servidor | Resultado |
|---|---|---|
| `tests/round3/schema-seed-check.mjs` | — | **8 PASS, 0 FAIL** |
| `tests/round3/verify-externos.mjs` (sem envs) | — | **3 SKIP, 0 FAIL** |
| `tests/round2/api-battery.mjs` | 3103 | **39 PASS, 0 FAIL** |
| `tests/round2/session-token.mjs` | 3104 (`SESSION_SECRET`) | **16 PASS, 0 FAIL** |
| `tests/round2/failure-mode.mjs` | 3101 (Supabase fake inacessível) | **7 PASS, 0 FAIL** |
| `tests/round2/browser.mjs` | 3103 (Edge real) | **37 PASS, 0 FAIL** |
| `tests/round3/homologation.mjs` | 3104 | **33 PASS, 0 FAIL** |
| `tests/round2/upstash-path.mjs` fase 1 + fase 2 | 3102 + mock | **3 PASS, 0 FAIL** |
| `tests/round3/multi-instance.mjs` memória | 3105 + 3106 | **2 PASS, 0 FAIL** |
| `tests/round3/multi-instance.mjs` upstash | 3105 + 3106 + mock | **2 PASS, 0 FAIL** |
| `npm run lint` | — | **0 erros, 0 warnings** |
| `npm run build` | — | **✓ 22/22, 0 erros de tipo** |

**Total: 147 PASS, 0 FAIL, 3 SKIP (integrações sem credencial).** Um flake de hidratação no
primeiro load do browser (botão do banner 8 s) não repetiu na reexecução — timing de intro, não
defeito.

## R3.3 Como homologar o ambiente publicado (roda com as credenciais)

```bash
# 1) prova as integrações (Supabase + Groq + Upstash)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_ANON_KEY=... \
GROQ_API_KEY=... UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
node tests/round3/verify-externos.mjs

# 2) homologação da URL publicada
node tests/round3/homologation.mjs https://SEU-PROJETO.vercel.app \
  --expect db=ok --expect llm=groq --expect origin=supabase

# 3) opcional: queima rate limit no IP do runner
node tests/round3/homologation.mjs https://SEU-PROJETO.vercel.app --deep
```

`verify-externos` prova, contra o banco real: `legal_topics ≥ 15` via service_role, insert de lead,
**anon não lê `leads`** (RLS), atualizar sessão A não toca na B. O `--expect origin=supabase`
só passa quando a KB veio do banco — o defeito fantasma da rodada 2 não pode voltar silencioso.

## R3.4 O que continua fora do código (ação do titular)

| Pendência | Bloco |
|---|---|
| Supabase real (projeto + 3 migrations + seed) | Infraestrutura |
| Groq `GROQ_API_KEY` | Infraestrutura |
| Upstash (2 envs) — sem ela o limite é por instância (provado na fase memória) | Infraestrutura |
| GA4/GTM/GSC/Bing reais + reexecutar `browser.mjs` na URL de produção | Validação final |
| `SESSION_SECRET` dedicada (opcional; sem Supabase/Sem segredo não há banco a proteger) | Segurança |
| Dado do titular: praças, GBP, foto, revisão de textos/OAB | Validação final |
| Revisão jurídica (Termos/Privacidade/Cookies) | Validação final |

## R3.5 Versão estável

Repositório versionado a partir deste ponto: build `22/22`, lint `0/0`, **147 asserções PASS / 0
FAIL** nas suites de `tests/round2` + `tests/round3`. Todo script é reexecutável; nada de
resultado colado sem ter rodado.
