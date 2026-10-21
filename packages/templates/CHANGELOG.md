# @gntik-ai/templates

## 0.10.0

### Minor Changes

- 609af5a: Localize batch-1 console labels in English and Spanish with optional per-key overrides; the expanded Messages type requires full custom catalogs to add the new keys, and blocks, templates and ui must release together.

### Patch Changes

- e130bce: Show platform-aware shortcut hints with useOs and the mod key token.
- 743ec1e: Report committed flow edits and save the current workflow graph with accurate unsaved status.
- 79cb85e: Add English/Spanish chart labels with ChartLocaleProvider and bridge the kit locale in chart blocks and ConsoleShell; generated accessible names now follow Spanish providers, while explicit props and English defaults remain unchanged.
- Updated dependencies [e130bce]
- Updated dependencies [d05dc61]
- Updated dependencies [77301a9]
- Updated dependencies [743ec1e]
- Updated dependencies [79cb85e]
- Updated dependencies [609af5a]
- Updated dependencies [9dd0d8d]
  - @gntik-ai/ui@0.10.0
  - @gntik-ai/blocks@0.10.0
  - @gntik-ai/charts@0.10.0
  - @gntik-ai/chat@0.10.0

## 0.9.0

### Patch Changes

- 7c8f3cc: Neutralise leading spreadsheet formula triggers in audit-log CSV exports.
- 8781fd7: Match text without accents or case in kit searches and filters, and highlight the original text at correct Unicode offsets.
- Updated dependencies [91529bb]
- Updated dependencies [4ab6493]
- Updated dependencies [73b19e3]
- Updated dependencies [53e8909]
- Updated dependencies [e67ab87]
- Updated dependencies [8781fd7]
- Updated dependencies [47c4582]
- Updated dependencies [0ce6f33]
- Updated dependencies [9de4924]
- Updated dependencies [57d8e4e]
- Updated dependencies [39b9e66]
- Updated dependencies [7340188]
  - @gntik-ai/ui@0.9.0
  - @gntik-ai/chat@0.9.0
  - @gntik-ai/blocks@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies [f98ac68]
  - @gntik-ai/blocks@0.8.0

## 0.7.0

### Minor Changes

- 0e5a63d: Add caller-defined wizard flows with localized labels, validation, abortable submit states and accessible navigation locks.

### Patch Changes

- Updated dependencies [0e5a63d]
- Updated dependencies [937c914]
- Updated dependencies [1f0e5ee]
- Updated dependencies [236f8e7]
- Updated dependencies [ccb56cf]
- Updated dependencies [90d8e31]
  - @gntik-ai/ui@0.7.0
  - @gntik-ai/blocks@0.7.0
  - @gntik-ai/chat@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [18f0018]
- Updated dependencies [442b687]
  - @gntik-ai/blocks@0.6.0

## 0.5.0

### Minor Changes

- 497aa09: Add a controlled live event stream template with subscription states, bounded quiet logs, selectable rows and a pinnable JSON inspector.
- 0f55d7b: Add read-only profile settings with identity, context and roles; reserve SettingsLayout saveBar='none' as an explicit wrapper opt-out (the literal previously rendered as text).
- 390081a: Add an opt-in read-only resource detail page with explicit data and controlled status history.

### Patch Changes

- 5fe9e8e: Publish all packages publicly on npmjs.org; projects should remove any old @gntik-ai:registry line from .npmrc to resolve new versions.
- Updated dependencies [f28226e]
- Updated dependencies [4992a03]
- Updated dependencies [497aa09]
- Updated dependencies [5fe9e8e]
- Updated dependencies [0f55d7b]
- Updated dependencies [7e634c7]
- Updated dependencies [80c9d78]
  - @gntik-ai/blocks@0.5.0
  - @gntik-ai/ui@0.5.0
  - @gntik-ai/charts@0.5.0
  - @gntik-ai/chat@0.5.0
  - @gntik-ai/editor@0.5.0
  - @gntik-ai/flow@0.5.0
  - @gntik-ai/icons@0.5.0
  - @gntik-ai/tokens@0.2.1

## 0.4.0

### Minor Changes

- 1319408: Add optional custom flow nodes with accessible connection targets, connection rules, validation problems, navigable read-only run views and consumer-injected YAML worker diagnostics compatible with Monaco 0.57, including focusable editor input and same-origin fonts under strict CSP, while preserving built-in node types.

### Patch Changes

- Updated dependencies [1319408]
  - @gntik-ai/flow@0.4.0
  - @gntik-ai/blocks@0.4.0
  - @gntik-ai/editor@0.4.0

## 0.3.0

### Minor Changes

- 005bcf8: Add configurable auth identifiers, consumer validation messages, focus controls, server-error associations, suppressible headings and optional auth content.
- cc88a1f: Add a pending-activation auth template with status, optional reference, allowed actions and recovery states without internal error code chips.
- 9aff41c: Add PublicHubPage for unauthenticated entry hubs with cards, navigation actions and accessible loading states.
- 965d2f7: Add a status heading slot and title focus refs so PageHeader can supply the only h1 on a not-found page.
- 618926a: Add accessible fullscreen and dialog wizard overlays, a dialog-wizard block, and an in-page create-wizard demo.

### Patch Changes

- 5da66c7: Add a read-only subordinate list section with server pagination and isolated loading, empty and retry states for resource forms.
- Updated dependencies [005bcf8]
- Updated dependencies [08c916d]
- Updated dependencies [6af5fae]
- Updated dependencies [68d9924]
- Updated dependencies [965d2f7]
- Updated dependencies [e51af67]
- Updated dependencies [5da66c7]
- Updated dependencies [618926a]
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
