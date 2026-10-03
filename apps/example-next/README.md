# @gntik-ai/example-next

gntik-ui on **Next.js 16 (App Router)**, React 19 and Tailwind 4 (`@tailwindcss/postcss`). Every
page is a kit template fed with this app's neutral data (`data/`), under the `gntikPreset` brand.
It shows the kit working with Server Components, client templates and no theme flash.

## Routes

| Route | Template |
| --- | --- |
| `/sign-in` | `SignInPage` |
| `/dashboard` | `HomeDashboardPage` |
| `/projects` | `ResourceIndexPage` (row menu → Open goes to the detail) |
| `/projects/[id]` | `ResourceDetailPage` (unknown id → not-found) |
| `/settings/profile` · `/settings/members` | `SettingsProfilePage` · `SettingsMembersPage` |
| `/settings/[section]` | the other seven settings templates (security, notifications, appearance, workspace, billing, api-keys, integrations) |
| `not-found.tsx` · `error.tsx` | `Status404Page` · `Status500Page` (Retry calls `reset`) |

`/` redirects to `/dashboard` and `/settings` to `/settings/profile`.

## How it is wired

- `app/globals.css`: `@import "tailwindcss"; @import "@gntik-ai/templates/styles.css";`. The
  Geist fonts come from `@fontsource` (imported in `app/layout.tsx`), so nothing is fetched at build time.
- `app/layout.tsx` (Server Component) reads the theme cookie, puts the class on `<html>`
  (`suppressHydrationWarning`) and inlines the theme script in `<head>`. The script is needed for
  `system`, which only the browser can resolve.
- `app/providers.tsx` (`'use client'`): `ThemeProvider` (gntik preset, dark default, mode from the
  cookie), `LinkProvider` wired to `next/link` (kit links and nav navigate client-side) and
  `TooltipProvider`.
- Each route is a Server Component `page.tsx` (metadata, `notFound()`, request time) that renders a
  small `'use client'` `view.tsx`, which passes the data and the router callbacks to the template.
- Relative dates in `data/` are built from a `now` the server passes down, so server HTML and
  hydration match.
- `next.config.ts` has no `transpilePackages`: the kit ships ESM `dist` with a `'use client'` banner.
  Server Components may import **types** from the kit, but not values (they would get client
  references). That is why `data/projects.ts` only imports types, and why the columns live in `data/columns.ts`.

## Run

```sh
pnpm --filter @gntik-ai/example-next dev     # http://localhost:3001
NEXT_TELEMETRY_DISABLED=1 pnpm --filter @gntik-ai/example-next build
pnpm --filter @gntik-ai/example-next start
pnpm --filter @gntik-ai/example-next typecheck
```

The kit packages must be built first (`dist`).
