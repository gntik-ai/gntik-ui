# @gntik-ai/blocks

## 0.11.0

### Minor Changes

- 966a473: Add opt-in detail-value wrapping and columns, page-title wrapping, and no-access request visibility and link actions while preserving defaults.
- 3cad9d6: Localise built-in form and authentication labels in English and Spanish with typed per-instance overrides.
- b366590: Add localized LogViewer level names, per-level label overrides, and optional full-message wrapping with measured rows.

### Patch Changes

- 8379594: Keep server-mode selected ids across pages in onSelectionChange and bulkActions (preserveSelection={false} restores page-only reporting); add localized select-all-matching models, disabled multiple-selection rows, hideSelectAll and paginated single selection. Keep matching-selection announcements in a persistent live region, preserve the default announcement surface and restore keyboard focus when clearing.
- Updated dependencies [3cad9d6]
- Updated dependencies [b366590]
- Updated dependencies [3b5e0b0]
- Updated dependencies [8379594]
  - @gntik-ai/ui@0.11.0
  - @gntik-ai/tokens@0.3.0
  - @gntik-ai/charts@0.11.0
  - @gntik-ai/editor@0.11.0
  - @gntik-ai/flow@0.11.0

## 0.10.0

### Minor Changes

- 609af5a: Localize batch-1 console labels in English and Spanish with optional per-key overrides; the expanded Messages type requires full custom catalogs to add the new keys, and blocks, templates and ui must release together.

### Patch Changes

- e130bce: Show platform-aware shortcut hints with useOs and the mod key token.
- 77301a9: Follow provider or runtime week starts and clocks in scheduling blocks, add weekend attributes and overrides, and export localeWeekStart; without a provider, en-US runtimes now use Sunday-first weeks and 12-hour times (pass weekStartsOn={1} and hourCycle="h23" to retain the previous layout).
- 743ec1e: Report committed flow edits and save the current workflow graph with accurate unsaved status.
- 79cb85e: Add English/Spanish chart labels with ChartLocaleProvider and bridge the kit locale in chart blocks and ConsoleShell; generated accessible names now follow Spanish providers, while explicit props and English defaults remain unchanged.
- 9dd0d8d: Unify locale-aware file sizes across thumbnails, uploads and chat, with binary and bit options, consistent chart unit promotion, and a decimal 25 MB default upload limit.
- Updated dependencies [e130bce]
- Updated dependencies [d05dc61]
- Updated dependencies [77301a9]
- Updated dependencies [79cb85e]
- Updated dependencies [609af5a]
- Updated dependencies [9dd0d8d]
  - @gntik-ai/ui@0.10.0
  - @gntik-ai/charts@0.10.0

## 0.9.0

### Patch Changes

- 8781fd7: Match text without accents or case in kit searches and filters, and highlight the original text at correct Unicode offsets.
- 0ce6f33: Read built-in component labels and PageHeader section names from the active English or Spanish catalog while preserving caller overrides.
- 9de4924: Format default table cells in the provider locale, with customizable boolean labels and English and Spanish yes/no catalog entries.
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

## 0.8.0

### Minor Changes

- f98ac68: Add masked multi-secret disclosure, inline presentation, redacted content slots and copy callbacks.

## 0.7.0

### Minor Changes

- 937c914: Add optional destructive-confirmation fields, validity gating, typed failure states and focus return, plus NotFoundEmpty and ErrorPanel announcement control.
- 1f0e5ee: Add opt-in controlled server pagination to DataTable for pages with a known total row count.
- 236f8e7: Add stateless cursor pagination and a responsive cursor pager footer with accessible busy states, optional counts and page-size selection.
- ccb56cf: Add an accessible load-more footer for cursor and flag lists with translated labels, retry, focus retention and append announcements.

### Patch Changes

- Updated dependencies [0e5a63d]
- Updated dependencies [236f8e7]
- Updated dependencies [ccb56cf]
- Updated dependencies [90d8e31]
  - @gntik-ai/ui@0.7.0

## 0.6.0

### Minor Changes

- 18f0018: Add configurable sign-up fields, optional consent, policy loading and unavailable states, validation summaries that focus every invalid control including consent with readable contrast in all themes, and minimum-length password guidance; short passwords now show the lowest strength level.
- 442b687: Add typed per-instance labels and formatters for PaginationFooter, FilterBar and DataTable chrome, including overflow region names, while preserving existing defaults and provider translations.
  
  Keep cell-editor errors readable on plain, hovered and selected rows with a dedicated token surface.

## 0.5.0

### Minor Changes

- f28226e: Add optional hidden range controls to ChartCard, preserve keyboard focus after pointer releases outside its range controls, and document custom ranges and toolbar-owned controlled selection.
- 497aa09: Add a controlled live event stream template with subscription states, bounded quiet logs, selectable rows and a pinnable JSON inspector.
- 7e634c7: Add opt-in single row selection to non-paginated DataTable with native radios, accessible labels including numeric legends, keyboard navigation that preserves table controls and pointer focus, disabled choices, a localized selection column and resize handles that avoid unnecessary scroll-container tab stops.
- 80c9d78: Add a non-interactive truncated collection footer with localized exact counts, lower-bound counts and truncation notes.

### Patch Changes

- 5fe9e8e: Publish all packages publicly on npmjs.org; projects should remove any old @gntik-ai:registry line from .npmrc to resolve new versions.
- Updated dependencies [4992a03]
- Updated dependencies [5fe9e8e]
- Updated dependencies [0f55d7b]
- Updated dependencies [7e634c7]
- Updated dependencies [80c9d78]
  - @gntik-ai/ui@0.5.0
  - @gntik-ai/charts@0.5.0
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
  - @gntik-ai/editor@0.4.0

## 0.3.0

### Minor Changes

- 005bcf8: Add configurable auth identifiers, consumer validation messages, focus controls, server-error associations, suppressible headings and optional auth content.
- 08c916d: Add a credential disclosure dialog with masked stored values, fresh-secret warnings, translated copy feedback and validated focus return.
- 68d9924: Add an opt-in plan summary without sample billing data and compact/full administrative plan definition cards.
- 965d2f7: Add a status heading slot and title focus refs so PageHeader can supply the only h1 on a not-found page.
- e51af67: Add an accessible StatusTimeline empty state and localizable labels with English and Spanish defaults.
- 5da66c7: Add a read-only subordinate list section with server pagination and isolated loading, empty and retry states for resource forms.
- 618926a: Add accessible fullscreen and dialog wizard overlays, a dialog-wizard block, and an in-page create-wizard demo.

### Patch Changes

- Updated dependencies [08c916d]
- Updated dependencies [6af5fae]
- Updated dependencies [965d2f7]
- Updated dependencies [e51af67]
- Updated dependencies [618926a]
  - @gntik-ai/ui@0.3.0

## 0.2.0

### Minor Changes

- dfb06cf: DataTable: column resize (pointer drag or a focusable `role="separator"` handle with arrow keys; min/max widths; controlled `columnWidths`), column pinning to either edge with sticky cells (column menu or `pinnedColumns`), row virtualization (`virtualize`, automatic above `virtualizeThreshold`; `aria-rowcount`/`aria-rowindex`; works with selection and grouping), inline cell editing (`editable` + `editor` per column, `onCellEdit` can reject with an inline error) and saved views (`views`, `activeViewId`, `onViewsChange`, `filters`) with a view switcher. Existing props and behaviour are unchanged.

  Charts: `thresholds` (labelled horizontal reference lines with a tone) and `annotations` (vertical markers with a label and a tooltip, listed as text under the plot) on Line, Area, Bar and Combo charts; a keyboard-accessible range `brush` with controlled `range`; `useLiveSeries` (sliding window, pause on hover/focus or manually) and an `animate` prop that is always off under prefers-reduced-motion.

- e07d276: Internationalization and RTL: `I18nProvider` / `useI18n` (English and Spanish catalogs, 290 typed keys, Intl formatters for numbers, currency, dates, relative time and lists; direction from the locale) drive every built-in string — label props still win. Physical utilities became logical ones (`ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`), directional icons mirror, and Drawer `left`/`right`, Resizable and ChatLayout follow `dir`.
- da3c8f1: Kit gaps reported by template authors:

  - **DataTable** — optional row groups: `groupBy` (field key or function), `groupLabel`, `collapsibleGroups`, `collapsedGroups` / `defaultCollapsedGroups` / `onCollapsedGroupsChange`. One `<tbody>` per group with a `th scope="rowgroup"` header (label + count), a keyboard-accessible collapse button and a group select checkbox; sorting applies inside groups. Default behaviour unchanged.
  - **ComparisonTable** (new block, `comparison-table`) — plans or options as columns, feature rows grouped by section, boolean (check / dash with screen-reader text), text or numeric values with optional notes, a recommended column marked with a text badge, and sideways scroll with a sticky feature column.
  - **TraceWaterfall** — controlled selection (`selectedId`, `onSelectedIdChange`), optional or custom details pane (`showDetails`, `renderDetails`), a one-tab-stop span list with arrow-key navigation, and a `running` span status (visible "running" label, pulse that stops under reduced motion). `SpanDetails`, `SPAN_STATUSES` and `runningTraceSpans` are exported.
  - **ChartCard** — `kind="heatmap"` renders the charts Heatmap (rows from `index`, columns from `categories`, colour scale as the legend, cells fitted to `height`, `heatmap` options), and every kind now passes `state`, `emptyMessage`, `errorMessage`, `onRetry` and `dataTable` through.
  - **Heatmap** (charts) — new `height` prop that fits the rows to a fixed height (exported `cellHeightFor`), and the colour grid scrolls sideways in narrow containers.
  - **CodePanel** — controlled open file (`activeFile`, `onActiveFileChange`; `defaultFile` still works uncontrolled) and `headingLevel` (2–6, default 3) for the "Problems" heading.
  - **PromptEditor** — controlled variable values (`variables`, `onVariablesChange`; `defaultVariables` still works uncontrolled).

- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.
- 4c6b5ec: Hardening from the product apps: PricingTable current/selectable plans; FlowBuilder controllable run console (consoleEntries is now controlled — pair it with onConsoleChange) and exported panels; `titleAs` heading levels on card-titled blocks; DataTable `selectionSummary` and column `variant` presets; usage-analytics, resource-detail, sign-in and audit-log copy/data props; FlowNode types re-exported from blocks.

### Patch Changes

- cf544b8: Density modes: `density.css` tokens and Tailwind utilities (`h-control`, `h-row`…), `DensityProvider`/`useDensity` (`compact | comfortable`), and `size: 'auto'` defaults so controls, tables and tabs follow the active density.
- cdeb737: SSR-safe theming and adoption fixes from the example apps: `@gntik-ai/ui/theme-script` (server-importable `themeScript`), ThemeProvider `initialMode` with hydration-safe storage reads, Timestamp `now`; charts default to `hsl(var(--token))` colours (`useChartTheme({ resolved: true })` for concrete values); ConsoleShell forwards sidebar options; every console template takes `shell`; resource-index and home-dashboard are data-generic; template data types and the settings frame/nav are exported.
- Updated dependencies [e85184e]
- Updated dependencies [f1ec6c1]
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
- Updated dependencies [ad65d0e]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [dfb06cf]
- Updated dependencies [00f0f06]
- Updated dependencies [e61b1c1]
  - @gntik-ai/charts@0.2.0
  - @gntik-ai/tokens@0.2.0
  - @gntik-ai/ui@0.2.0
  - @gntik-ai/editor@0.2.0
  - @gntik-ai/icons@0.2.0
  - @gntik-ai/flow@0.2.0
