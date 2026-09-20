# STITCH-MAP — Portfólio Guilherme Bernardo

**Projeto:** Guilherme Bernardo — Portfólio (Product Designer)
**Fonte:** `../export/` — export de design system (Claude Design/Stitch-style: HTML +
JSX servidos via CDN React/Babel-standalone, sem build) encontrado na pasta do
repositório. Nenhuma árvore de telas (`ARVORE-TELAS.md`), `TELAS.md`,
`COMPORTAMENTO.md` ou `BRIEFING.md` foi anexada nesta conversa — o inventário
abaixo foi levantado diretamente do roteador da aplicação (`App()` em
`export/ui_kits/portfolio/index.html`) e do `README.md` do próprio export, que já
descrevem exatamente duas superfícies de produto.

## Inventário de telas

| Tela | Status | Origem | Notas |
|---|---|---|---|
| **Home** (hero, sobre, jornada/experiência, cases, competências, ferramentas, formação, contato) | FOUND_IN_HTML | `Home.jsx` + `HomeSections.jsx` + `Hero.jsx` | Traduzido 1:1 para módulos ES reais; nenhum conteúdo criado do zero. |
| **Case — Trade-in** (`#case=trade-in`) | FOUND_IN_HTML | `CaseTradeIn.jsx` + `case-trade-in.js` | Case completo, com antes/depois, stats, protótipo, aprendizados. |
| **Case — App Agi** (`#case=app-agi`) | FOUND_IN_HTML | `CaseTradeIn.jsx` (mesmo componente, `data=GB_AGIBANK`) + `case-agibank.js` | Mesmo template, dataset próprio. |
| **Case genérico** (fallback para slug sem dataset dedicado) | FOUND_IN_HTML | `CaseStudy.jsx` | Não é acionado hoje (só há 2 cases, ambos com dataset próprio); mantido por já existir no export e ser o fallback do roteador. |

Não há MISSING: as três superfícies do roteador já vinham com HTML/JSX completo
no export. Nenhuma tela foi inventada fora do que o `App()` original já servia.

## Fluxos críticos validados (Playwright, headless Chromium)

- Home → clique no card do case "Trade-in" → abre `CaseTradeIn` com o dataset de
  Trade-in → breadcrumb "Início" volta para a Home.
- Home → clique no card "App Agi" → abre o mesmo template com `GB_AGIBANK`.
- Troca de idioma PT/EN via `LanguageSwitch` (contexto `GB_LangProvider`).
- Scroll-reveal (`Reveal`, `ScrollCharReveal`), timeline com progresso por
  scroll, marquee de competências, cursor customizado, cortina de abertura —
  todos portados e re-testados sem erros de console.
- Build de produção (`npm run build`) e dev server (`npm run dev`) limpos, sem
  warnings de React.

## Decisão de arquitetura (1 frase)

**Vite + React + Tailwind v4**, mantendo o design system bespoke original
(tokens CSS + `gb-components.css`) como camada de estilo principal — Tailwind
entra disponível para qualquer extensão futura, mas o visual já polido (motion,
z-index, breakpoints) não foi reescrito em utilities para não arriscar
regressão visual num sistema que já era consistente e documentado
(`export/design.md`).

## Imagens

Todas as imagens referenciadas pelo export (capas de case, marcas de empresas,
retrato, ~80 telas de produto em `assets/cases/*`) **já existiam** e foram
copiadas para `public/assets/`. Não havia imagens quebradas — nenhum
placeholder do Unsplash foi necessário.
