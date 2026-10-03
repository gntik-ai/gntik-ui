---
"@gntik-ai/blocks": minor
"@gntik-ai/charts": minor
---

DataTable: column resize (pointer drag or a focusable `role="separator"` handle with arrow keys; min/max widths; controlled `columnWidths`), column pinning to either edge with sticky cells (column menu or `pinnedColumns`), row virtualization (`virtualize`, automatic above `virtualizeThreshold`; `aria-rowcount`/`aria-rowindex`; works with selection and grouping), inline cell editing (`editable` + `editor` per column, `onCellEdit` can reject with an inline error) and saved views (`views`, `activeViewId`, `onViewsChange`, `filters`) with a view switcher. Existing props and behaviour are unchanged.

Charts: `thresholds` (labelled horizontal reference lines with a tone) and `annotations` (vertical markers with a label and a tooltip, listed as text under the plot) on Line, Area, Bar and Combo charts; a keyboard-accessible range `brush` with controlled `range`; `useLiveSeries` (sliding window, pause on hover/focus or manually) and an `animate` prop that is always off under prefers-reduced-motion.
