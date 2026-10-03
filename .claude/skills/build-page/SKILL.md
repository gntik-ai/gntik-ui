---
name: build-page
description: Build a product page (dashboard, list, detail, settings, auth, status…) from gntik-ui templates, layouts and blocks using the gntik-ui CLI and the gntik-ui MCP tools. Use when asked to create or rebuild a page or screen with the gntik-ui kit or a gntik-ai product app (musematic, Falcone, example apps).
---

# Build a page with the gntik-ui kit

Goal: the page is composed from kit items with package imports, carries the product's data and
handlers, and passes the brand rules. Order of preference: **template → layout + blocks → components**.

## 1. Find candidates

Use the MCP server if it is connected, otherwise the CLI (both read `kit-registry.json`):

| Need | MCP | CLI |
| --- | --- | --- |
| Templates for the page type | `list_kit kind=template query="members"` | `gntik-ui search members --kind template --json` |
| Blocks | `list_kit kind=block group=tables` | `gntik-ui list --kind block --group tables --json` |
| Details, props, source | `get_template id` / `get_block id` / `get_component id` | `gntik-ui docs <id> --json`, then read the files it lists |

Read the template's `Page.tsx` (and `data.ts`) to learn its props before wiring it: props are all
optional and default to fixtures, so missing data still renders — do not ship the fixtures.

## 2. Scaffold

- Template fits: `scaffold_page template=<id> route=/path` → paste the file. Console templates take a
  `shell` prop: build ONE `Omit<ConsoleShellProps, 'children'>` for the product (nav groups,
  workspaces, user, usage, topbar, `currentHref`) and reuse it on every page
  (reference: `apps/example-vite/src/shell.tsx`).
- No template: `scaffold_page blocks=[page-header, kpi-row, data-table] layout=console route=/path`.
  Layouts: `console` (ConsoleShell + Page), `page` (inside a shell that already has `<main>`),
  `auth-layout`, `stacked-layout`, `docs-layout`, `canvas-layout`, `print-layout`. Layouts with
  required slots (settings, split, inspector, wizard, status) are easier from a template.
- Without MCP, write the same shape by hand: imports from `@gntik-ai/templates`, `@gntik-ai/blocks`,
  `@gntik-ai/ui`, `@gntik-ai/icons` — never relative paths into `packages/`.

## 3. Wire data and behaviour

- Replace fixtures with product data (typed with the exported types, e.g. `KpiItem`, `ActivityItem`).
- Hook up handlers (`onSubmit`, `onRowSave`, `onQuickAction`…) and navigation (`href`/router).
- Product names, logos and copy come from the app (fixtures/preset), never from kit code.
- Need copy-owned source instead of the package? `gntik-ui add <block|template id>` copies it with
  imports rewritten; `gntik-ui eject <component id>` for a component.

## 4. App wiring (once)

- `<ThemeProvider brand={preset}>` at the root; preset from `scaffold_preset name="Product"`
  (name + logo only, colours never change). SSR: inline `themeScript` in `<head>`.
- Global CSS: `@import "tailwindcss";` then Geist fonts, `@gntik-ai/ui/styles.css`, and
  `@gntik-ai/templates/styles.css` when using blocks/templates. `gntik-ui init` does this.

## 5. Check

- `validate_page` (MCP) on the new file → 0 errors. Run the `brand-review` skill on the diff.
- App gates: typecheck, lint, tests. In this repo: `pnpm lint && pnpm typecheck && pnpm test`;
  apps/musematic and apps/falcone must stay kit-only (`node apps/<app>/scripts/check-kit-only.mjs`).
