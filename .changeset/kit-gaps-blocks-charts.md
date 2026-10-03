---
"@gntik-ai/blocks": minor
"@gntik-ai/charts": minor
---

Kit gaps reported by template authors:

- **DataTable** — optional row groups: `groupBy` (field key or function), `groupLabel`, `collapsibleGroups`, `collapsedGroups` / `defaultCollapsedGroups` / `onCollapsedGroupsChange`. One `<tbody>` per group with a `th scope="rowgroup"` header (label + count), a keyboard-accessible collapse button and a group select checkbox; sorting applies inside groups. Default behaviour unchanged.
- **ComparisonTable** (new block, `comparison-table`) — plans or options as columns, feature rows grouped by section, boolean (check / dash with screen-reader text), text or numeric values with optional notes, a recommended column marked with a text badge, and sideways scroll with a sticky feature column.
- **TraceWaterfall** — controlled selection (`selectedId`, `onSelectedIdChange`), optional or custom details pane (`showDetails`, `renderDetails`), a one-tab-stop span list with arrow-key navigation, and a `running` span status (visible "running" label, pulse that stops under reduced motion). `SpanDetails`, `SPAN_STATUSES` and `runningTraceSpans` are exported.
- **ChartCard** — `kind="heatmap"` renders the charts Heatmap (rows from `index`, columns from `categories`, colour scale as the legend, cells fitted to `height`, `heatmap` options), and every kind now passes `state`, `emptyMessage`, `errorMessage`, `onRetry` and `dataTable` through.
- **Heatmap** (charts) — new `height` prop that fits the rows to a fixed height (exported `cellHeightFor`), and the colour grid scrolls sideways in narrow containers.
- **CodePanel** — controlled open file (`activeFile`, `onActiveFileChange`; `defaultFile` still works uncontrolled) and `headingLevel` (2–6, default 3) for the "Problems" heading.
- **PromptEditor** — controlled variable values (`variables`, `onVariablesChange`; `defaultVariables` still works uncontrolled).
