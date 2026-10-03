# @gntik-ai/charts

## 0.2.0

### Minor Changes

- e85184e: Data-viz system: token-only sequential/diverging ramps, SAFE_CHART_COLORS (luminance-separated categorical order), chart states (loading, empty, error with retry) and screen-reader data tables on every chart; new FunnelChart, SankeyChart, RadarChart, Heatmap and MiniBar; chartFmt gains percent, duration and bytes.
- f1ec6c1: Charts default to the colour-blind-safe series order (`primary, violet, cyan, rose, amber`): every adjacent pair differs in luminance by ≥ 1.5:1 in all three themes. `SAFE_CHART_COLORS` is now an alias of `CHART_COLORS`. Pass `colors` to keep the previous order.
- dfb06cf: DataTable: column resize (pointer drag or a focusable `role="separator"` handle with arrow keys; min/max widths; controlled `columnWidths`), column pinning to either edge with sticky cells (column menu or `pinnedColumns`), row virtualization (`virtualize`, automatic above `virtualizeThreshold`; `aria-rowcount`/`aria-rowindex`; works with selection and grouping), inline cell editing (`editable` + `editor` per column, `onCellEdit` can reject with an inline error) and saved views (`views`, `activeViewId`, `onViewsChange`, `filters`) with a view switcher. Existing props and behaviour are unchanged.

  Charts: `thresholds` (labelled horizontal reference lines with a tone) and `annotations` (vertical markers with a label and a tooltip, listed as text under the plot) on Line, Area, Bar and Combo charts; a keyboard-accessible range `brush` with controlled `range`; `useLiveSeries` (sliding window, pause on hover/focus or manually) and an `animate` prop that is always off under prefers-reduced-motion.

- da3c8f1: Kit gaps reported by template authors:

  - **DataTable** — optional row groups: `groupBy` (field key or function), `groupLabel`, `collapsibleGroups`, `collapsedGroups` / `defaultCollapsedGroups` / `onCollapsedGroupsChange`. One `<tbody>` per group with a `th scope="rowgroup"` header (label + count), a keyboard-accessible collapse button and a group select checkbox; sorting applies inside groups. Default behaviour unchanged.
  - **ComparisonTable** (new block, `comparison-table`) — plans or options as columns, feature rows grouped by section, boolean (check / dash with screen-reader text), text or numeric values with optional notes, a recommended column marked with a text badge, and sideways scroll with a sticky feature column.
  - **TraceWaterfall** — controlled selection (`selectedId`, `onSelectedIdChange`), optional or custom details pane (`showDetails`, `renderDetails`), a one-tab-stop span list with arrow-key navigation, and a `running` span status (visible "running" label, pulse that stops under reduced motion). `SpanDetails`, `SPAN_STATUSES` and `runningTraceSpans` are exported.
  - **ChartCard** — `kind="heatmap"` renders the charts Heatmap (rows from `index`, columns from `categories`, colour scale as the legend, cells fitted to `height`, `heatmap` options), and every kind now passes `state`, `emptyMessage`, `errorMessage`, `onRetry` and `dataTable` through.
  - **Heatmap** (charts) — new `height` prop that fits the rows to a fixed height (exported `cellHeightFor`), and the colour grid scrolls sideways in narrow containers.
  - **CodePanel** — controlled open file (`activeFile`, `onActiveFileChange`; `defaultFile` still works uncontrolled) and `headingLevel` (2–6, default 3) for the "Problems" heading.
  - **PromptEditor** — controlled variable values (`variables`, `onVariablesChange`; `defaultVariables` still works uncontrolled).

- d8de1ff: First component release: `@gntik-ai/ui` P1 components on Base UI with ThemeProvider and brand presets; icons, charts, flow and editor packages; contrast-safe pairing aliases and the runtime token adapter in `@gntik-ai/tokens`.
- cdeb737: SSR-safe theming and adoption fixes from the example apps: `@gntik-ai/ui/theme-script` (server-importable `themeScript`), ThemeProvider `initialMode` with hydration-safe storage reads, Timestamp `now`; charts default to `hsl(var(--token))` colours (`useChartTheme({ resolved: true })` for concrete values); ConsoleShell forwards sidebar options; every console template takes `shell`; resource-index and home-dashboard are data-generic; template data types and the settings frame/nav are exported.
- cdeb737: Compositions: 12 layouts and the remaining P1 components in `@gntik-ai/ui` (layout primitives, content, form inputs, app-shell pieces); new packages `@gntik-ai/blocks` (69 blocks), `@gntik-ai/templates` (40 page templates), `@gntik-ai/chat` (AI chat pack) and `@gntik-ai/cli` (init, add, eject, list, search, docs). Tokens gain `text-<tone>-chip-text` aliases for tinted chips; every package ships a `styles.css` for Tailwind sources.

### Patch Changes

- 689b5c4: Heatmap: `showValues` labels sit on a card-coloured chip so they meet AA contrast on every ramp step in all three themes.
- Updated dependencies [cf544b8]
- Updated dependencies [d8de1ff]
- Updated dependencies [cdeb737]
- Updated dependencies [ad65d0e]
  - @gntik-ai/tokens@0.2.0
