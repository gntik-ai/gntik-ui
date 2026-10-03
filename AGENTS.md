# AGENTS.md — gntik-ui

Guide for coding agents working **in** this repo or building products **with** the kit.
`CLAUDE.md` (Spanish) is the binding source for the decisions below; this file is its English,
agent-oriented summary.

## What this is

gntik-ui is the **product-agnostic** design system of gntik-ai: React 19 + Tailwind CSS 4
components on Base UI, layouts, page blocks and page templates over one token layer. Products
(musematic, Falcone, llmwiki…) are **presets** (name + logo + assets) plus example apps; their
domain data lives in fixtures, never in components. pnpm monorepo, Node 24, pnpm 11.

| Package | What |
| --- | --- |
| `@gntik-ai/tokens` | The brand: `brand.css` (3 themes), Tailwind v4 bridge, `pairing.css` contrast aliases, `runtime` adapter for JS-side colours |
| `@gntik-ai/ui` | Components + layouts (`src/layouts`) on Base UI, `ThemeProvider`, `themeScript`, `Logo`, brand presets |
| `@gntik-ai/blocks` | Page-level blocks (`src/<family>/<Name>/`, `block.meta.ts`) |
| `@gntik-ai/templates` | Full pages (`src/<id>/Page.tsx`, `template.meta.ts`); console pages share `ConsoleShell` |
| `@gntik-ai/chat` · `icons` · `charts` · `flow` · `editor` | AI chat pack · lucide + `Icon` · Recharts · @xyflow/react · Monaco |
| `@gntik-ai/cli` | `gntik-ui init · add · eject · list · search · docs` (`--json`) |
| `packages/mcp` | MCP server (private, Docker image) |
| `apps/docs` | The catalog (Vite); `preview.html?kind=block\|layout\|template&id=…` renders one item |
| `apps/example-vite`, `apps/example-next`, `apps/musematic`, `apps/falcone` | Products built only from the kit |

## Decisions (fixed — do not revert without asking the owner)

- **Agnostic content.** Core code never names a product. English copy everywhere (catalog, docs, fixtures).
- **Frozen colours.** HSL values in `packages/tokens/src/brand.css` never change (a test freezes them).
  Presets differ only in logo, name and assets. Contrast is fixed by pairing existing tokens, never by new values.
- **Themes:** dark (default) · light · high_contrast.
- **Headless primitives:** Base UI. **Packages:** `@gntik-ai/*` on GitHub Packages. **Docs:** Vercel.
- **Interactive:** everything that can be interactive is (overlays open, ⌘K filters, toggles, drag/zoom).
- **One canonical version per component**, refined later with feedback.

## Hard rules (lint and tests enforce most of them)

- Token classes only: `bg-*`, `text-*`, `border-*`, `fill-*` that resolve to tokens. No hex/rgb/hsl
  literals, no Tailwind palette colours (`bg-red-500`), no gradients, no glow, no `dark:` variants.
- Sober: flat brand-tinted shadows. Green (hue 145) is the only brand colour; the primary is never a
  severity colour (red/amber/blue-info are).
- Brand-coloured text: `text-primary-text`, `text-success-text`, `text-warning-text`,
  `text-destructive-text`. On tinted backgrounds (chips, badges): `text-<tone>-chip-text`.
  Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring`.
  Inline links are underlined.
- JS-side colours (charts, canvas) only via `@gntik-ai/tokens/runtime` (`tokenColor`, `tokenHex`, `observeTheme`).
- Accessibility: correct roles/names, full keyboard support, axe-clean, `motion-reduce:` on animations.
- Strict TS (`noUncheckedIndexedAccess`), no `any`, react-hooks v7 rules, files under 1000 lines (aim for < 400).

## Finding things

- **`kit-registry.json`** (root, generated): every installable item — `id`, `kind`
  (component | layout | block | template), `package`, `group`, `status`, `description`, `files`,
  `dependencies`, `registryDependencies`, `docs` (its `*.doc.ts` / `*.meta.ts`). Ids are unique across kinds.
- **CLI:** `gntik-ui list --kind block --json` · `gntik-ui search "members table" --json` ·
  `gntik-ui docs dialog --json` (keyboard contract, files, deps).
- **MCP server** (`packages/mcp`): `list_kit` (kind/group/query) · `get_component` · `get_block` ·
  `get_template` (metadata, deps, usage snippet, full source) · `scaffold_page` · `scaffold_preset` ·
  `validate_page` · `get_tokens` · `get_rules`.
- **llms.txt:** `apps/docs/public/llms.txt` and `llms-full.txt` (generated from the registry).
- Real usage: `packages/ui/src/components/<Name>/examples/*.tsx`, `apps/example-vite/src/`.

## Building a page with the kit

Prefer, in this order:

1. **A template** (`list_kit kind=template`). Render it and pass data/handlers; every prop is optional
   and falls back to fixtures. Console templates render inside `ConsoleShell` and take a `shell` prop
   (nav, workspaces, user, usage, topbar) — define it once for the product
   (see `apps/example-vite/src/shell.tsx`). `scaffold_page template=<id>` writes the file.
2. **Layout + blocks.** `ConsoleShell` (or a `@gntik-ai/ui` layout) + `Page` + blocks in a `Stack`.
   Inside a shell that already renders `<main>`, use `Page` alone or the layout's `embedded` prop.
   `scaffold_page blocks=[…] layout=console|page|auth-layout|stacked-layout|…`.
3. **Components** to fill gaps (`get_component <id>`). Never restyle a kit component with ad-hoc colours.

Theme wiring (once per app):

```tsx
// main.tsx
import { ThemeProvider } from '@gntik-ai/ui';
import { acmePreset } from './brand'; // scaffold_preset name="Acme"
<ThemeProvider brand={acmePreset}><App /></ThemeProvider>
```

```css
/* global CSS */
@import "tailwindcss";
@import "@fontsource/geist";
@import "@fontsource/geist-mono";
@import "@gntik-ai/ui/styles.css";
@import "@gntik-ai/templates/styles.css"; /* when using blocks/templates */
```

SSR (Next.js): inline `themeScript` in `<head>` so the first paint has the right theme class
(see `apps/example-next/app/layout.tsx`). `gntik-ui init` does the CSS, `.npmrc` and package wiring.

## Adding or changing a kit item

- **Component:** follow `packages/ui/CONTRIBUTING.md` — `src/components/<Name>/` with `<Name>.tsx`
  (on Base UI), `<name>.variants.ts` (`tv()`), `<Name>.doc.ts` (name, group, status, description,
  primitive, pattern, keyboard, tokens), `examples/*.tsx`, `<Name>.test.tsx` (every keyboard row +
  `expectNoAxeViolations`), `index.ts`. Export it from `packages/ui/src/index.ts`, add a changeset.
- **Block:** `packages/blocks/src/<family>/<Name>/` with `<Name>.tsx`, `fixtures.ts`, `block.meta.ts`
  (`uses` lists the kit components). Props default to fixtures so `<Name />` renders.
- **Template:** `packages/templates/src/<id>/Page.tsx` (default export), `data.ts`, `template.meta.ts`
  (`layout`, `blocks`); console pages use `shared/ConsoleShell`.
- **Catalog entry** (`apps/docs/src/catalog/`): section with interactive preview + `<CodeBlock>`,
  `window.SECTIONS['id']`, `status:'done'` in `registry.jsx`.
- Then `pnpm registry` (regenerates `kit-registry.json`, `INVENTORY.md`, `registry.json`, `llms*.txt`)
  and `pnpm changeset`. Packages consume each other's `dist`: run `npx tsdown` in a changed package.
- Visual baselines regenerate in CI with `[visual-update]` in the commit message.

## Gates (run before calling anything done)

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm registry:check
pnpm a11y   # when ui/blocks/templates change: axe in a browser on every composition
```

Skills for Claude Code live in `.claude/skills/` (`build-page`, `add-component`, `brand-review`).
