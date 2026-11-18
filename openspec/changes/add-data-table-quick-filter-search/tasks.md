# Tasks

## 1. Implementation

- [x] 1.1 Add the quick filter props to data-table-props.ts, `quickFilter` to `DataTableColumn` in data-table-utils.ts, and a pure `quickFilterRows` helper built on `matchText` in quick-filter.ts.
- [x] 1.2 Apply it in DataTable.tsx before `groupRows` and `sortRows` in client mode, and wire the server path to `onQuickFilterChange`, `onQueryChange` and `onPageChange(1)`.
- [x] 1.3 Add the built-in and collapsible field in quick-filter-field.tsx, the `table.quickFilter` and `table.quickFilterResults` keys in the en and es catalogs, and their `DataTableLabels` overrides.
- [x] 1.4 Add `queryDebounceMs` to FilterBar and `searchDebounceMs` to PageToolbar.
- [x] 1.5 Move the query matching of the audit-log template to `quickFilter` with an actor column matcher.

## 2. Tests

- [x] 2.1 Unit tests for `quickFilterRows`.
- [x] 2.2 DataTable.quick-filter.test.tsx: page reset, footer total, select-all, group counts, server callbacks, debounce with fake timers, Enter and Escape, collapsible focus return and the polite count.
- [x] 2.3 FilterBar and PageToolbar debounce tests, and audit-log Page.test.tsx searches and export parity.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/blocks`, `@gntik-ai/templates` and `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-data-table-quick-filter-search --strict`.
