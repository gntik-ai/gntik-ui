# DataTable: add a debounced quick filter across columns, plus opt-in query debounce on FilterBar and PageToolbar

## Why

- DataTable has no search of its own, so list pages match the search text themselves before passing `rows`, each with its own fields and rules.
- Server lists cannot send a search term with page and sort, and the FilterBar and PageToolbar inputs call their callbacks on every keystroke, so a server page refetches once per character.

## What Changes

- `quickFilter`, `defaultQuickFilter`, `onQuickFilterChange`, `showQuickFilter` (boolean or `'collapsible'`) and `quickFilterDebounceMs` (default 300) on DataTable; a `quickFilter` column setting (boolean or matcher function); `DataTableQuery.quickFilter` and `cause: 'quickFilter'`.
- A row matches when every whitespace-separated term matches at least one searchable column (AND across terms, OR across columns) through `matchText`, over the accessor value as text and the display text.
- Client mode filters before sorting, grouping and paging, together with the filter model (AND). Server mode never filters rows and reports the term.
- A built-in field on the kit `SearchField` with a collapsible mode and a polite match-count status; `table.quickFilter` and `table.quickFilterResults` in English and Spanish, with `DataTableLabels` overrides.
- FilterBar `queryDebounceMs` and PageToolbar `searchDebounceMs` (default 0).
- The audit-log template searches through the quick filter and exports exactly the events its table shows.

## Impact

- Capabilities: blocks/data-table, blocks/filter-bar, blocks/page-toolbar (ADDED; no baseline spec).
- Risk R1: additive and optional. Roll back by reverting or pinning the previous `@gntik-ai/blocks`.
- audit-log: a multi-word query now needs every word to match some field instead of one substring.

## Decisions

- A function matcher follows the visibility rule of an unset column: it runs while the column is visible.
- Saved views do not capture the term; it stays transient.
- Hidden columns are searched only with `quickFilter: true`.
- The matching lives in `quick-filter.ts`, the state in `use-quick-filter.ts` and the field in `quick-filter-field.tsx` (a `.tsx` beside `quick-filter.ts` would not resolve), keeping DataTable.tsx under 1000 lines.

## Non-goals

- Per-column filter UI and the filter model; OR between terms, quoted phrases and highlighting.
- New debounce hooks and changes to SearchField; migrating resource-index and search-results.
- Server-side search itself; saving the term in saved views.
