# @gntik-ai/templates

## 0.3.0

### Minor Changes

- 005bcf8: Add configurable auth identifiers, consumer validation messages, focus controls, server-error associations, suppressible headings and optional auth content.
- cc88a1f: Add a pending-activation auth template with status, optional reference, allowed actions and recovery states without internal error code chips.
- 9aff41c: Add PublicHubPage for unauthenticated entry hubs with cards, navigation actions and accessible loading states.
- 965d2f7: Add a status heading slot and title focus refs so PageHeader can supply the only h1 on a not-found page.

### Patch Changes

- 5da66c7: Add a read-only subordinate list section with server pagination and isolated loading, empty and retry states for resource forms.
- Updated dependencies [005bcf8]
- Updated dependencies [08c916d]
- Updated dependencies [965d2f7]
- Updated dependencies [e51af67]
- Updated dependencies [5da66c7]
  - @gntik-ai/blocks@0.3.0
  - @gntik-ai/ui@0.3.0
  - @gntik-ai/chat@0.3.0

## 0.2.0

### Minor Changes

- e07d276: Internationalization and RTL: `I18nProvider` / `useI18n` (English and Spanish catalogs, 290 typed keys, Intl formatters for numbers, currency, dates, relative time and lists; direction from the locale) drive every built-in string — label props still win. Physical utilities became logical ones (`ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`), directional icons mirror, and Drawer `left`/`right`, Resizable and ChatLayout follow `dir`.
- cdeb737: SSR-safe theming and adoption fixes from the example apps: `@gntik-ai/ui/theme-script` (server-importable `themeScript`), ThemeProvider `initialMode` with hydration-safe storage reads, Timestamp `now`; charts default to `hsl(var(--token))` colours (`useChartTheme({ resolved: true })` for concrete values); ConsoleShell forwards sidebar options; every console template takes `shell`; resource-index and home-dashboard are data-generic; template data types and the settings frame/nav are exported.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.
- 4c6b5ec: Hardening from the product apps: PricingTable current/selectable plans; FlowBuilder controllable run console (consoleEntries is now controlled — pair it with onConsoleChange) and exported panels; `titleAs` heading levels on card-titled blocks; DataTable `selectionSummary` and column `variant` presets; usage-analytics, resource-detail, sign-in and audit-log copy/data props; FlowNode types re-exported from blocks.
- 395c10e: New `incident-board` template: incident triage Kanban in the console (KPI strip, FilterBar, KanbanBoard by stage with announced keyboard moves, details Drawer). `docs-article` now shows Breadcrumbs, an underlined inline link and a reference Table.
- 7675e22: P3 templates: run-trace, prompt-playground, evaluations, model-providers, code-editor and data-explorer.
- b09edd6: P3 templates: scorecard, incident-console, resource-tree, board (keyboard drag-and-drop), messaging, help-home, docs-article, changelog, keyboard-shortcuts, and the public pack's pricing and contact pages.

### Patch Changes

- Updated dependencies [e85184e]
- Updated dependencies [f1ec6c1]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [cf544b8]
- Updated dependencies [f4638d1]
- Updated dependencies [fc405b4]
- Updated dependencies [689b5c4]
- Updated dependencies [e07d276]
- Updated dependencies [da3c8f1]
- Updated dependencies [da3c8f1]
- Updated dependencies [d8de1ff]
- Updated dependencies [cdeb737]
- Updated dependencies [cdeb737]
- Updated dependencies [4c6b5ec]
- Updated dependencies [ad65d0e]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [00f0f06]
- Updated dependencies [e61b1c1]
  - @gntik-ai/charts@0.2.0
  - @gntik-ai/chat@0.2.0
  - @gntik-ai/blocks@0.2.0
  - @gntik-ai/tokens@0.2.0
  - @gntik-ai/ui@0.2.0
  - @gntik-ai/editor@0.2.0
  - @gntik-ai/icons@0.2.0
  - @gntik-ai/flow@0.2.0
