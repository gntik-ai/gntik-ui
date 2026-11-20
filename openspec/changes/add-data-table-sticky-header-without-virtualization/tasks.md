# Tasks

## 1. Implementation

- [x] 1.1 Add `stickyHeader`, `stickyHeaderOffset` and `maxHeight` to data-table-props.ts with the per-layout offsets in their docs and in block.meta.ts.
- [x] 1.2 Add use-sticky-header.ts (horizontal overflow and scroller height through ResizeObserver) and use it in DataTable.tsx for the card classes, container classes, `max-height`, region name and `data-sticky-header`.
- [x] 1.3 Pin the column, selection and actions header cells with `top: var(--data-table-sticky-top)` and the head tint layer (header-cell.tsx, special-head.tsx), and add the row `scroll-margin-top`.
- [x] 1.4 Add examples/sticky-header.tsx and examples/sticky-header-stacked.tsx for SidebarLayout, StackedLayout and `maxHeight`.

## 2. Tests

- [x] 2.1 DataTable.sticky-header.test.tsx: classes, CSS variable, mode switch with a mocked ResizeObserver, bounded region name and the unchanged DOM without props.
- [x] 2.2 apps/docs/e2e/data-table-sticky-header.a11y.spec.js: header position after scrolling in both layouts, focus not obscured, and the bounded body's scrollbar inside the viewport.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/blocks`, patch for `@gntik-ai/ui` (catalog strings).
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-data-table-sticky-header-without-virtualization --strict`.
