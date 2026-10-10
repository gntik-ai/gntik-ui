# @gntik-ai/blocks

## 0.3.0

### Minor Changes

- 005bcf8: Add configurable auth identifiers, consumer validation messages, focus controls, server-error associations, suppressible headings and optional auth content.
- 08c916d: Add a credential disclosure dialog with masked stored values, fresh-secret warnings, translated copy feedback and validated focus return.
- 965d2f7: Add a status heading slot and title focus refs so PageHeader can supply the only h1 on a not-found page.
- e51af67: Add an accessible StatusTimeline empty state and localizable labels with English and Spanish defaults.
- 5da66c7: Add a read-only subordinate list section with server pagination and isolated loading, empty and retry states for resource forms.

### Patch Changes

- Updated dependencies [08c916d]
- Updated dependencies [965d2f7]
- Updated dependencies [e51af67]
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
