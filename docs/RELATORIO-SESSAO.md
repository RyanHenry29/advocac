# RELATÓRIO DA SESSÃO — 24/08/2026 (trabalho autônomo)

## 1. Resumo executivo

A plataforma completa foi construída e o build de produção está **verde**. O sistema passa a ser o Next.js do monorepo `advocac-site/apps/web` (substitui o MVP estático da pasta `site/`, que permanece como referência). Supabase (memória do chat) e Groq (IA) estão **implementados e aguardando apenas as chaves** — sem elas, o site funciona 100% com fallback local.

## 2. O que foi entregue nesta sessão

### Plataforma (apps/web)
| Área | Entregas |
|---|---|
| Design system | Tokens da ID visual (#17191C · #C8A15A · #4E5838 · #B8683A · #EFE9DF), Bebas Neue/Barlow/IBM Plex Mono via next/font |
| Intro cinematográfica | Logo cobre a tela (anéis blueprint girando) → toque/deslize (mobile) ou scroll/clique (desktop) → cortina desce → coreografia do hero em cascata; 1x por sessão; reduz-motion respeitado |
| Motion system | `Reveal` (scroll, 4 variantes), marquee, hero full-screen 100dvh, micro-interações 100–300ms em transform/opacity |
| Páginas | Home (resultados reais + fatos verificados), O Escritório, Atuação (10 áreas), Central CAC (6 guias + FAQ), Atendimento (chat dedicado), Diagnóstico (3 perguntas → análise), Contato (form + WhatsApp), Termos, Privacidade, Cookies, 404 |
| Chat | Widget flutuante + página, máquina de estados, chips, fonte+data em cada resposta, handoff WhatsApp com resumo pronto |
| APIs serverless | `/api/chat` (pipeline completo + log no Supabase), `/api/leads` (Zod + honeypot), `/api/health` |
| Motor de atendimento | SAFETY (recusas/urgência) → CLASSIFIER (14 tópicos) → RETRIEVER (Supabase c/ cache 5min → fallback local) → GROQ (opcional) → VALIDATOR (bloqueia promessa de resultado) |
| Base de conhecimento | 14 tópicos + 13 fatos da empresa **extraídos um a um do feed @advocac_** (22 posts analisados) |
| Segurança | Chaves só server-side, RLS no Supabase, rate limiting, headers OWASP, Zod em toda entrada |
| SEO | Metadata/canonical/OG por página, JSON-LD (LegalService, FAQPage), sitemap, robots, manifest, URL dinâmica (Vercel → domínio futuro sem tocar código) |
| Build | ✅ 19 rotas, ~98 kB first load, zero erros |

### Banco de dados (supabase/)
- 3 migrations (conhecimento c/ pgvector · conversas/leads · RLS)
- Seed idempotente: 14 tópicos, 5 documentos oficiais, 5 regras críticas, 4 serviços regulados

### Documentação
- `docs/SKILL-INDEX.md` — índice das 280 skills (acesso rápido)
- `docs/CONTENT-MAP.md` — inventário completo do feed (o que existe, gaps)
- `docs/DEPLOYMENT.md` — guia passo a passo Vercel+Supabase+Groq (30–45 min)
- `ETAPAS-DESENVOLVIMENTO.md` atualizado (E2–E4 concluídas; E5 adiada com gatilhos)
- `.gitignore` com proteção de segredos

## 3. Decisões tomadas (registradas)

1. **Sem painel admin customizado** (sua decisão): edição de conhecimento via dashboard do Supabase; painel custom só se os gatilhos da E5 forem atingidos.
2. **IA = Groq** (sua decisão): llama-3.3-70b-versatile, com fallback canônico se falhar/estourar cota.
3. **Domínio depois**: URL da Vercel funciona imediatamente; `advocac.com.br` é só uma env var quando existir.

## 4. O que falta (checklist do titular)

### Para publicar (obrigatório)
- [ ] Criar projeto Supabase + rodar 3 migrations + seed (guia: `DEPLOYMENT.md` §1)
- [ ] Criar conta Groq + API key (§2)
- [ ] Subir para GitHub + importar na Vercel com as env vars (§3)
- [ ] Validar `/api/health` = `db:ok, llm:groq` (§4)

### Para validar antes de publicar (recomendado)
- [ ] Revisar textos do Escritório (dados sensíveis: OAB, credenciais IAT, estados atendidos)
- [ ] Foto profissional do titular (não existe no feed — hoje o site usa o logo)
- [ ] Confirmar WhatsApp comercial ativo para receber leads
- [ ] Ler/aprovar Termos, Privacidade e Cookies (rascunhos prontos, marcados p/ revisão jurídica)

### Evolução (pode esperar)
- [ ] Domínio `advocac.com.br` + Search Console (§5)
- [ ] Google Meu Negócio (busca local "advogado CAC perto de mim")
- [ ] Painel admin (E5) — só quando houver volume
- [ ] Embeddings/RAG vetorial (pgvector já no schema; hoje o retrieval é por palavras-chave, suficiente)
- [ ] PWA offline completo + analytics com consentimento

## 5. Como testar localmente

```bash
cd advocac-site/apps/web
npm install
cp .env.example .env.local   # preencha se tiver as chaves
npm run dev                  # http://localhost:3000
npm run build                # build de produção
```

## 6. Estrutura final

```
advocac-site/
├── apps/web/                  ← SITE (Vercel aponta aqui)
│   ├── src/app/               19 rotas (páginas + APIs + SEO)
│   ├── src/components/        brand · motion · sections · chatbot · layout · forms
│   ├── src/lib/               chatbot/ · knowledge/ · supabase/ · security/ · config
│   └── public/                icon.svg · images/ (marca + estande)
├── supabase/                  migrations ×3 + seed
├── docs/                      SKILL-INDEX · CONTENT-MAP · DEPLOYMENT
├── package.json / turbo.json  monorepo
└── .gitignore
```

## 7. Atualização 05/11/2026 — identidade do PDF aplicada ao site

O `ID Visual Advocac.pdf` (7 páginas) foi lido e confrontado com o código. O que estava fora do manual e foi corrigido:

| Ponto | Antes | Agora |
|---|---|---|
| Logo | `LogoMark` apontava para `/logo-ajustada.png`, arquivo inexistente — marca quebrada em header, rodapé e chat | variantes reais (`logo.png` + 4 monocromáticas), padrão `color` |
| Escala da marca | 22–32 px no chrome | `LOGO_MIN` 36 / 72 / 166 do manual; header 36, rodapé 44, chat 36, 404 72 |
| Off-white | `#EFEAE0` no Tailwind (o CSS já usava `#EFE9DF`) | `#EFE9DF` em tudo |
| Destaque único | foco de campo, hover de card, scrollbar e barra de progresso em oliva | latão no foco/hover/progresso; oliva só em apoio (bolha do usuário, citação, passos) |
| Rodapé | copyright + cookies + disclaimer | assinatura `@advocac_ · nome · OAB` em IBM Plex Mono à esquerda e símbolo em latão à direita |

Nome e OAB vêm de `NEXT_PUBLIC_LAWYER_NAME` e `NEXT_PUBLIC_OAB` (`.env.example`). Sem as envs, a assinatura mostra só `@advocac_`.

O PDF termina no título da seção 4 (`RODAPÉ DAS LEGENDAS — O FECHAMENTO PADRÃO`) — o corpo dessa seção não veio na impressão. O padrão aplicado é o que aparece nas capas e no grid: `@ · nome · OAB/UF` à esquerda, símbolo em latão à direita.

Build atual: 22 rotas, 103 kB first load (o `next/image` no hero adiciona ~5 kB), zero erros. `next lint` não roda nesta combinação: o projeto está em flat config (`eslint.config.mjs`) e o Next 14.2 pede `.eslintrc`; a checagem de tipos do build cobre o TypeScript.

## 8. Atualização 05/11/2026 — regras do manual que faltavam + peso do hero

| Ponto | Antes | Agora |
|---|---|---|
| Norma em mono | `IN 311/25-DG/PF`, `Lei 9.784/1999`, `arts. 48 e 49` no mesmo corpo Barlow | `NormText` (`src/components/brand/NormText.tsx`) isola o número e aplica IBM Plex Mono a 92% em off-white; aplicado na Central CAC (guias + FAQ), em Atuação e em Termos (`Lei nº 13.709/2018`) |
| Marca d'água | manual prevê monocromática vazada em card, carimbo e adesivo — não existia no site | `logo-watermark.png` (gerado de `logo-offwhite.png` a 6% de alfa) como fundo de `.card`, canto inferior direito, 120 px |
| Hero | 2 MB de PNG como `background-image` de CSS (sem srcset, sem otimização, LCP no arquivo cru) | `next/image` com `fill priority sizes="100vw"`: WebP 16 kB em 750 px, 36 kB em 1200, 64 kB em 1920. Overlay único em `bg-base/55` |
| Peso morto | `hero-bg.png` e `hero-newhero.png` idênticos a `hero-novo.png` (mesmo md5, 2 MB cada) + `src/app/_document.tsx` vazio | removidos; o build não referencia nenhum dos três |

Verificado no servidor de produção: `/central-cac` renderiza os 6 números em mono, `/atuacao` renderiza `IN 311/25-DG/PF`, o otimizador devolve `image/webp` quando o cliente aceita WebP, e o CSS publicado contém `logo-watermark` com `efe9df` (2 ocorrências) e `efeae0` (zero).
