# Falcone — built only from the kit

The second gntik-ai product on gntik-ui (the second half of the Phase 3 gate). Falcone is a
multi-tenant serverless backend platform: tenants own projects; projects have stages
(dev / staging / prod), functions, workflows, an MCP server endpoint, bring-your-own-key LLM
providers, quotas and metering, real-time channels and an audit log. Every page is a kit
template fed with Falcone data, or a composition of kit layouts and blocks. The app owns no
styles, no colours and no widgets: only `src/data/` (domain fixtures), a route table and a tiny
router.

- Brand: `ThemeProvider brand={falconePreset}` (dark by default, persisted under
  `falcone-theme`); `themeScript()` is inlined in `<head>` by `vite.config.ts`.
  **`falconePreset` is a placeholder** — a token-coloured "F" monogram until Falcone's real logo
  artwork lands in `@gntik-ai/ui` (`packages/ui/src/theme/presets.tsx`). Nothing in this app
  changes when it does.
- Router: `src/router.tsx` (history API), wired to the kit through `LinkProvider`.
- CSS: `src/index.css` = Tailwind + `@gntik-ai/templates/styles.css` + Geist fonts. Nothing else.
- Shell: `src/shell.ts` — Falcone nav, the tenant switcher (kit workspaces), the invocation
  quota meter and the topbar, passed to every template's `shell`.

## Routes

| Route | Built from |
| --- | --- |
| `/sign-in` | `SignInPage` |
| `/` | `HomeDashboardPage` (invocations, error rate, p95, cost KPIs; metered-cost and invocations charts; activity; quick actions) |
| `/projects` | `ResourceIndexPage` (Falcone columns; rows link via `getRowHref`) |
| `/projects/:id` | `ResourceDetailPage` (stages, MCP endpoint, channels, model provider, metrics) |
| `/functions` | `ResourceIndexPage` (runtime, stage, invocations, p95, errors; the project cell links to the project) |
| `/workflows/:id` (`/workflows` → first) | `WorkflowBuilderPage` |
| `/usage` | `UsageAnalyticsPage` (metering per tenant / project / stage) |
| `/audit` | `AuditLogPage` |
| `/settings/*` | the nine settings templates with `extraNavItems`; `/settings/model-providers` = `SettingsFrame` + `ModelKeysList` |
| anything else | `Status404Page` |

## Run

```sh
pnpm --filter @gntik-ai/falcone dev        # http://localhost:5173
pnpm --filter @gntik-ai/falcone build      # tsc --noEmit && vite build
pnpm --filter @gntik-ai/falcone preview    # http://localhost:4176
```

The kit packages are consumed from their `dist`, so build them first (`pnpm build` at the root).

## Gate check

```sh
node apps/falcone/scripts/check-kit-only.mjs
```

Fails if any file in `src/` sets `className=` or `style=`, contains a hex / `rgb()` / `hsl()`
colour literal, imports anything but `react`, `react-dom`, `@gntik-ai/*` or a relative path, or
if there is a CSS file other than `src/index.css` (which may only `@import` Tailwind, the kit and
the Geist fonts).
