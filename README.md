# Gntik UI

The design system for gntik-ai products (musematic, Falcone, llmwiki…). One token layer,
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
│  └─ example-next/         the kit on Next.js 16 (App Router, SSR-safe theme)
├─ packages/
│  ├─ tokens/               @gntik-ai/tokens: brand.css (3 themes), Tailwind v4 bridge,
│  │                        contrast pairing aliases, runtime token adapter
│  ├─ ui/                   @gntik-ai/ui: components on Base UI + ThemeProvider + presets
│  ├─ icons/                @gntik-ai/icons: lucide + Icon with brand sizes
│  ├─ charts/               @gntik-ai/charts: Recharts 3, token-themed
│  ├─ flow/                 @gntik-ai/flow: @xyflow/react 12, token-themed
│  ├─ editor/               @gntik-ai/editor: Monaco 0.57, token-themed
│  ├─ chat/                 @gntik-ai/chat: AI chat pack (layout, messages, safe markdown…)
│  ├─ blocks/               @gntik-ai/blocks: 69 page sections composed from the kit
│  ├─ templates/            @gntik-ai/templates: 40 complete pages (layouts + blocks)
│  ├─ cli/                  @gntik-ai/cli: `gntik-ui init | add | eject | list | search | docs`
│  └─ mcp/                  MCP server for Claude Code (container image, private)
├─ .changeset/              release notes; Release workflow publishes to GitHub Packages
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

Phase 3 of the design-system proposal is in: 79 components and 12 layouts in `@gntik-ai/ui`,
69 blocks, 40 page templates (P1, P2 and some P3), the chat pack and the CLI. The docs show
the catalog (63 entries), the package Library, and Layouts / Blocks / Templates galleries
previewed per device and theme. Gates: keyboard + axe unit tests in every package, axe in the
browser on every composition in three themes (`pnpm a11y`), and musematic rebuilt only from
the kit (`node apps/musematic/scripts/check-kit-only.mjs`), with Falcone as the second
product on it (`apps/falcone`, placeholder logo until its artwork lands). Visual baselines are
recorded on the CI runner: push a commit whose message contains `[visual-update]` to re-record
them after an intended visual change. Next: Phase 4 (ecosystem).
