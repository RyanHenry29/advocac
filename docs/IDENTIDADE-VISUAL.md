# IDENTIDADE VISUAL — ADVOCAC

Fonte: `ID Visual Advocac.pdf` (aprovado em 02/10/2026).

## Paleta

| Token | Hex | Uso |
|---|---|---|
| Grafite | `#17191C` | fundo |
| Latão | `#C8A15A` | único destaque |
| Off-white | `#EFEAE0` | texto |
| Verde-oliva | `#4E5838` | apoio |
| Cobre | `#B8683A` | detalhe |
| Vermelho | `#C0392B` | somente Radar / erro |

Paleta fechada: não muda mais. Um destaque só — latão. Oliva é apoio, cobre é
detalhe e vermelho existe apenas no Radar (e em erro de formulário no site).

No site, os tokens ficam em `apps/web/tailwind.config.ts` e `apps/web/src/styles/globals.css`.
Foco de campo, hover de card e barra de progresso usam latão; oliva fica em
estado de apoio (bolha do usuário no chat, citação, bloco de passos).

## Tipografia

- **Bebas Neue** — títulos, somente caixa alta.
- **Barlow SemiBold** — corpo, alinhado à esquerda, até 25 palavras por slide.
- **IBM Plex Mono** — número de norma, ofício e processo.

## Logo

- Versão ajustada: mesmo terno, mesma cor e cartucho realista. Saiu a faixa preta
  que cortava a munição e o fundo de grade, miras e texto.
- O cartucho é contínuo — a cabeça do estojo encosta no corpo, como na munição real.
- Terno em vetor: formas redesenhadas da original, mesmas proporções e cor, bordas
  nítidas em qualquer tamanho.
- Arquivos: `logo.png` (cor), `logo-latao.png`, `logo-offwhite.png`,
  `logo-grafite.png`, `logo-preto.png` — todos PNG transparente.
- Aplicação no site: `LogoMark` (`apps/web/src/components/brand/LogoMark.tsx`).

### Escala mínima

| Aplicação | Tamanho |
|---|---|
| Comentário / chrome do site | 36 px |
| Stories | 72 px |
| Perfil | 160 px |

`LOGO_MIN` em `LogoMark.tsx`. Header 36, rodapé 44, chat 36, 404 72, retrato do
escritório 220, intro 140.

### Monocromática

Tirada da própria original: as partes que eram pretas ficam vazadas. Serve de
marca d'água em cards, carimbo, bordado e adesivo. A de latão vai no rodapé das
capas e fecha o rodapé do site, à direita.

## Painel de capas (Instagram)

Formato 1080 × 1350. Selo da série no topo, conteúdo no meio, rodapé com `@`,
nome e OAB à esquerda e o símbolo em latão à direita.

| Série | Regra |
|---|---|
| Aviso | card único, sem selo; data é o elemento gráfico (repetir todo mês) |
| CAC x PF | tese em 3 a 5 palavras, enorme; fundo liso, sem textura nem pistola apagada |
| Explica em 60s | capa de reel com a tela do sistema; dentro do vídeo, gravação emoldurada e legenda em latão |
| Radar | print do documento oficial inclinado com marca-texto latão; único lugar onde o vermelho aparece |
| Na prática | única série com foto (mãos, case, estande), escurecida e com contraste alto |

## Rodapé das legendas — o fechamento padrão

```
@advocac_ · Seu Nome · OAB/UF 000.000
```

O site replica o padrão no rodapé: à esquerda a assinatura em IBM Plex Mono
(`@advocac_ · nome · OAB`, com nome e OAB vindos de `NEXT_PUBLIC_LAWYER_NAME` e
`NEXT_PUBLIC_OAB`) e à direita o símbolo em latão.

> O PDF termina no título da seção 4 — o conteúdo desse fechamento não veio na
> impressão. O padrão acima é o que aparece nas capas e no grid.

## Correção editorial incorporada

O material reforça que **renda não é requisito para o CR**: o Decreto nº 11.615/2023 exige **ocupação lícita**, não rendimentos. Essa posição foi aplicada na Central CAC, na base do chatbot (`company.ts`, `local.ts`) e no seed do Supabase.
