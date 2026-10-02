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
│  ├─ tokens/               @gntik-ai/tokens: brand.css (3 themes) + Tailwind v4 bridge
│  └─ mcp/                  @gntik-ai/gntik-ui-mcp: MCP server for Claude Code
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
pnpm registry         # regenerate registry.json after touching the catalog
```

## Adopt in a product

1. Install the tokens (GitHub Packages, scope `@gntik-ai`):
   `.npmrc` → `@gntik-ai:registry=https://npm.pkg.github.com`, then `pnpm add @gntik-ai/tokens`.
2. In the global CSS, after Tailwind v4:
   ```css
   @import "tailwindcss";
   @import "@gntik-ai/tokens/tailwind.css";   /* brand.css + token → utility mapping */
   ```
   Every token becomes a utility (`bg-primary`, `text-muted-foreground`, `bg-primary/14`).
3. Activate the theme by class on `<html>`: `dark` (default) · `""` (light) · `high_contrast`.
4. Load Geist and Geist Mono (`@fontsource/geist`, `@fontsource/geist-mono`).
5. Copy each component's code from the catalog.

## Status

59 catalog entries (Overview → Inventory). The evolution plan (layouts, page templates,
blocks, packages) follows the design-system proposal; this workspace is its Phase 1.
