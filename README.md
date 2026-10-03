# Gntik UI

The design system for gntik-ai products (musematic, Falcone…). One token layer,
many products: each product is a theme preset (logo, name, assets) over the same palette.
The catalog is Tailwind Plus-style: every component is **shown** with an interactive preview
and ships its **React/Tailwind code** to copy.

> Green `145 61% 50%` (hue 145) · Geist + Geist Mono · `--radius 0.625rem` · dark is the
> default theme · light and high contrast. Colour values are frozen (see `CLAUDE.md`).

## Workspace

pnpm monorepo, Node 24 (`.nvmrc`), pnpm 11 (`packageManager`).

```
gntik-ui/
├─ apps/
│  ├─ docs/                 the catalog: Vite + React 19 + Tailwind 4
│  │  ├─ src/catalog/       one section per file (registry.jsx = the inventory)
│  │  ├─ preview.html       renders one block / layout / template per iframe
│  │  └─ e2e/               Playwright visual baselines + axe gates
│  ├─ musematic/            musematic rebuilt only from the kit (the Phase 3 gate)
│  ├─ falcone/              Falcone on the kit (second product; placeholder brand preset)
│  ├─ example-vite/         neutral starter a new product clones
│  ├─ sandbox/              in-browser playground: edit a page live against the kit
│  └─ example-next/         the kit on Next.js 16 (App Router, SSR-safe theme)
├─ packages/
│  ├─ tokens/               @gntik-ai/tokens: brand.css (3 themes), Tailwind v4 bridge,
│  │                        contrast pairing aliases, motion + density tokens, runtime
│  │                        adapter, DTCG / Figma variables export
│  ├─ ui/                   @gntik-ai/ui: components on Base UI + ThemeProvider + presets
│  ├─ icons/                @gntik-ai/icons: lucide + Icon with brand sizes
│  ├─ charts/               @gntik-ai/charts: Recharts 3, token-themed
│  ├─ flow/                 @gntik-ai/flow: @xyflow/react 12, token-themed
│  ├─ editor/               @gntik-ai/editor: Monaco 0.57, token-themed
│  ├─ chat/                 @gntik-ai/chat: AI chat pack (layout, messages, safe markdown…)
│  ├─ blocks/               @gntik-ai/blocks: 69 page sections composed from the kit
│  ├─ templates/            @gntik-ai/templates: 57 complete pages (layouts + blocks)
│  ├─ cli/                  @gntik-ai/cli: `gntik-ui init | add | eject | list | search | docs | upgrade`
│  ├─ codemods/             @gntik-ai/codemods: jscodeshift transforms behind `gntik-ui upgrade`
│  ├─ evals/                agent evals: can an agent build pages with the kit only? (private)
│  └─ mcp/                  MCP server for Claude Code (container image, private)
├─ .changeset/              release notes; Release workflow publishes to GitHub Packages
│                           (canary workflow publishes snapshot builds)
├─ docs/governance/         lifecycle, release policy, review rubric, spec template
├─ AGENTS.md · .claude/     instructions and skills for coding agents (build-page,
│                           add-component, brand-review)
├─ apps/docs/public/r/      shadcn-compatible registry (`npx shadcn add <url>`)
├─ apps/docs/public/llms*.txt  the kit as plain text for LLMs
├─ blocks/                  static HTML references (Shell · Login · Fleet-filters)
├─ registry.json            generated index of the catalog (`pnpm registry`)
├─ kit-registry.json        generated index of every installable item (CLI + MCP)
└─ INVENTORY.md             text mirror of the inventory
```

## Develop

```bash
corepack enable
pnpm install
pnpm dev              # catalog at http://localhost:5173
pnpm lint && pnpm typecheck && pnpm test
pnpm build
pnpm visual           # Playwright visual baselines (pnpm visual:update after intended changes)
pnpm a11y             # axe on the @gntik-ai/ui examples in all three themes
pnpm registry         # regenerate registry.json after touching the catalog
pnpm changeset        # describe a change to a published package
```

## Adopt in a product

Fastest path: `npx @gntik-ai/cli init` in a Vite or Next app (writes `.npmrc`, CSS imports,
`gntik-ui.json` and the theme wiring, installs the packages), then `gntik-ui add <id>` for
components, blocks or page templates (`gntik-ui list --json` shows everything). By hand:

1. Install from GitHub Packages (scope `@gntik-ai`):
   `.npmrc` → `@gntik-ai:registry=https://npm.pkg.github.com`, then `pnpm add @gntik-ai/ui`
   (it brings `@gntik-ai/tokens`; add `@gntik-ai/charts`, `flow`, `editor` as needed).
2. In the global CSS, after Tailwind v4:
   ```css
   @import "tailwindcss";
   @import "@gntik-ai/ui/styles.css";   /* tokens + token → utility mapping + component sources */
   ```
   Every token becomes a utility (`bg-primary`, `text-muted-foreground`, `bg-primary/14`).
   Brand-coloured text uses the contrast-safe aliases (`text-primary-text`, `text-warning-text`…).
   Text on a tinted chip uses `text-<tone>-chip-text`. Building on blocks or templates?
   Import `@gntik-ai/templates/styles.css` instead: it brings ui, blocks, charts, chat, flow
   and editor sources in one line.
3. Wrap the app: `<ThemeProvider brand={musematicPreset}>` (dark by default; light,
   high_contrast or system; persisted). Inline `themeScript()` in `<head>` to avoid a flash.
4. Load Geist and Geist Mono (`@fontsource/geist`, `@fontsource/geist-mono`).
5. Import components: `import { Button, Dialog, DialogContent } from '@gntik-ai/ui'`, layouts
   (`SidebarLayout`, `SettingsLayout`…), blocks (`import { KpiRow } from '@gntik-ai/blocks'`)
   or whole pages (`import { HomeDashboardPage } from '@gntik-ai/templates'`). See
   `apps/example-vite` (Vite) and `apps/example-next` (Next.js) for complete wiring.

## Status

Phase 4 of the design-system proposal is in. `@gntik-ai/ui` has 95 components and 12 layouts,
with i18n (`I18nProvider`, English and Spanish, logical RTL utilities) and density modes
(`DensityProvider`: comfortable or compact). On top: 69 blocks, 57 page templates (P1–P3), the
chat pack, charts (funnel, sankey, radar, heatmap, colour-safe palette), the CLI with
`upgrade` codemods, a shadcn-compatible registry, `llms.txt`, MCP tools that scaffold pages
and presets, agent skills, a sandbox, a theme builder and agent evals. Tokens export to DTCG
JSON and Figma variables.

Gates: keyboard + axe unit tests in every package, axe in the browser on every composition in
three themes (`pnpm a11y`), and musematic and Falcone rebuilt only from the kit
(`apps/*/scripts/check-kit-only.mjs`; Falcone keeps a placeholder logo until its artwork
lands). Visual baselines are recorded on the CI runner: push a commit whose message contains
`[visual-update]` to re-record them after an intended visual change. Agent evals call the
Claude API and cost money, so they only run with `--confirm-spend`.
