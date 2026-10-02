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
│  └─ docs/                 the catalog: Vite + React 19 + Tailwind 4
│     ├─ src/catalog/       one section per file (registry.jsx = the inventory)
│     ├─ e2e/               Playwright visual baselines
├─ packages/
│  ├─ tokens/               @gntik-ai/tokens: brand.css (3 themes), Tailwind v4 bridge,
│  │                        contrast pairing aliases, runtime token adapter
│  ├─ ui/                   @gntik-ai/ui: components on Base UI + ThemeProvider + presets
│  ├─ icons/                @gntik-ai/icons: lucide + Icon with brand sizes
│  ├─ charts/               @gntik-ai/charts: Recharts 3, token-themed
│  ├─ flow/                 @gntik-ai/flow: @xyflow/react 12, token-themed
│  ├─ editor/               @gntik-ai/editor: Monaco 0.57, token-themed
│  └─ mcp/                  MCP server for Claude Code (container image, private)
├─ .changeset/              release notes; Release workflow publishes to GitHub Packages
├─ blocks/                  static HTML references (Shell · Login · Fleet-filters)
├─ registry.json            generated index of the catalog (`pnpm registry`)
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
   Using charts or flow too? Add `@source "../node_modules/@gntik-ai/charts/dist";` (and
   `flow`), and `@import "@gntik-ai/flow/styles.css";` for the canvas.
3. Wrap the app: `<ThemeProvider brand={musematicPreset}>` (dark by default; light,
   high_contrast or system; persisted). Inline `themeScript()` in `<head>` to avoid a flash.
4. Load Geist and Geist Mono (`@fontsource/geist`, `@fontsource/geist-mono`).
5. Import components: `import { Button, Dialog, DialogContent } from '@gntik-ai/ui'`.

## Status

60 catalog entries (Overview → Inventory) and the first `@gntik-ai/ui` component set
(Phase 2 of the design-system proposal). Next: layouts, blocks and page templates (Phase 3).
