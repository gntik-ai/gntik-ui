# musematic — rebuilt only from the kit

The Phase 3 gate app: musematic (an AI agent platform — workspaces run fleets of agents) rebuilt
from gntik-ui alone. Every page is a kit template fed with musematic data, or a composition of
kit layouts and blocks. The app owns no styles, no colours and no widgets: only
`src/data/` (domain fixtures), a route table and a tiny router.

- Brand: `ThemeProvider brand={musematicPreset}` (dark by default, persisted under
  `musematic-theme`); `themeScript()` is inlined in `<head>` by `vite.config.ts`.
- Router: `src/router.tsx` (history API), wired to the kit through `LinkProvider`.
- CSS: `src/index.css` = Tailwind + `@gntik-ai/templates/styles.css` + Geist fonts. Nothing else.

## Routes

| Route | Built from |
| --- | --- |
| `/sign-in`, `/mfa` | `SignInPage`, `MfaPage` |
| `/` | `HomeDashboardPage` (fleet KPIs, runs chart, activity, quick actions) |
| `/agents`, `/agents/:id`, `/agents/new` | `ResourceIndexPage`, `ResourceDetailPage`, `CreateWizardPage` |
| `/fleet` | `ResourceGalleryPage` |
| `/runs` | `ResourceIndexPage` |
| `/runs/:id` | `ConsoleShell` + `Page` + `PageHeader` + `TraceWaterfall` + `TokenCostCard` + `DescriptionListCard` |
| `/workflows/:id` (`/workflows` → first) | `WorkflowBuilderPage` |
| `/assistant` | `AssistantChatPage` |
| `/evaluations` | `ConsoleShell` + `Page` + `PageHeader` + `EvaluationScorecard` |
| `/settings/*` | the nine settings templates; `/settings/model-keys` = `ConsoleShell` + `SettingsLayout` + `PageHeader` + `ModelKeysList` |
| anything else | `Status404Page` |

## Run

```sh
pnpm --filter @gntik-ai/musematic dev        # http://localhost:5173
pnpm --filter @gntik-ai/musematic build      # tsc --noEmit && vite build
pnpm --filter @gntik-ai/musematic preview    # http://localhost:4175
```

The kit packages are consumed from their `dist`, so build them first (`pnpm build` at the root).

## Gate check

```sh
node apps/musematic/scripts/check-kit-only.mjs
```

Fails if any file in `src/` sets `className=` or `style=`, contains a hex / `rgb()` / `hsl()`
colour literal, imports anything but `react`, `react-dom`, `@gntik-ai/*` or a relative path, or
if there is a CSS file other than `src/index.css` (which may only `@import` Tailwind, the kit and
the Geist fonts).
