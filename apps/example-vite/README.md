# example-vite — the gntik-ui starter

The neutral starting point for a new gntik-ai product: Vite 8 + React 19 + Tailwind 4, the
`gntik` brand preset and an "Acme Inc." workspace. Every page is a `@gntik-ai/templates` template
fed with the app's own data — no custom widgets, no custom CSS. Clone it, swap the data, rename.

```bash
pnpm --filter @gntik-ai/example-vite dev       # http://localhost:5173
pnpm --filter @gntik-ai/example-vite build     # tsc --noEmit && vite build
pnpm --filter @gntik-ai/example-vite preview   # serves dist/ (SPA fallback for every route)
```

## What `gntik-ui init` set up (and this app keeps)

- `gntik-ui.json` (framework, CSS entry, brand, aliases) and `.npmrc` (`@gntik-ai` → GitHub Packages).
- `src/index.css`: Tailwind, Geist + Geist Mono, `@gntik-ai/ui/styles.css`, plus the extra Geist
  weights and `@gntik-ai/templates/styles.css` (blocks, charts, chat… sources) for the templates.
- `src/main.tsx`: `<ThemeProvider brand={gntikPreset}>` (dark by default, persisted).
- `vite.config.ts`: inlines `themeScript()` in `<head>` so the stored theme applies before first paint.

## Layout

| File | Role |
| --- | --- |
| `src/App.tsx` | Route table + `LinkProvider` (kit links navigate client-side) |
| `src/router.tsx` | ~60-line history router (`usePath`, `navigate`, `RouterLink`, `matchPath`) — swap for React Router when you outgrow it |
| `src/shell.tsx` | The console frame every signed-in page shares: nav, workspaces, user, ⌘K, notifications |
| `src/pages/*` | One small wrapper per route: a template + data + callbacks |
| `src/data/*` | All product data (Acme workspace, projects, inbox, search, members, billing, status copy). Replace with your API |

## Routes

| Route | Template |
| --- | --- |
| `/sign-in` · `/sign-up` · `/forgot-password` | SignIn · SignUp · ForgotPassword |
| `/` | HomeDashboard |
| `/projects` · `/projects/:id` · `/projects/new` | ResourceIndex · ResourceDetail · CreateWizard |
| `/inbox` · `/search` | NotificationInbox · SearchResults |
| `/settings/{profile,members,billing,appearance}` | SettingsProfile · SettingsMembers · SettingsBilling · SettingsAppearance (with Acme data) |
| `/settings/{security,notifications,workspace,api-keys,integrations}` | the rest of the settings nav, on template sample data |
| `/onboarding` | CreateWorkspace |
| `/status/{403,404,500,maintenance}` and any unknown path | Status403 · Status404 · Status500 · StatusMaintenance |

Auth and forms are simulated (a short delay, then navigate). Replace the favicon placeholder in
`index.html` with your product mark.
