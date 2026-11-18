# DataTable: keep rows during refetch and separate no-results from empty states

## Why

- While `loading` is true, `DataTableBody` swaps every row for skeleton rows and DataTable hides the `PaginationFooter`, disables the header checkbox and turns virtualization off, so each server page, sort or poll makes rows blink and the footer jump away.
- One `emptyState` serves both a first-run list and a filtered list with no matches, and the default says "Nothing matches the current filters." even when nothing was filtered.

## What Changes

- `loading` widens to `boolean | 'refresh'`. `'refresh'` keeps the current rows, selection, virtualization and footer, sets `aria-busy` and overlays an indeterminate kit `Progress` on the top edge of the body without changing the table height. With no rows it behaves like `true`.
- A polite "Updating {caption}…" status (`table.updating`, `DataTableLabels.updating`) only follows a page, page-size, sort, filter or view request the table emitted; a caller-started refresh such as polling is silent.
- New `noResultsState` and `filtered` (default `false`) pick the empty branch: `noResultsState`, then `emptyState`, then the default when filtered.
- English and Spanish catalog entry, block.meta documentation, `examples/refresh-loading.tsx`, minor changesets for `@gntik-ai/blocks` and `@gntik-ai/ui`.

## Impact

- Capability: blocks/data-table (ADDED; no baseline spec).
- Risk R1: additive and opt-in; `loading={true}` and existing empty states render as before. Roll back by reverting or pinning the previous `@gntik-ai/blocks` and `@gntik-ai/ui`.
- Stale rows stay actionable during a refresh and the footer can show the requested page before its rows arrive.

## Decisions

- `filtered` stays an explicit flag; it is not derived from `filters`.
- Refresh logic lives in `use-refresh-status.ts` and `refresh-indicator.tsx` to keep DataTable.tsx under 1000 lines.

## Non-goals

- Load-error state in the body, fetching, caching and retries (`add-blocks-use-table-data`).
- Highlighting rows changed by a refresh.
- Restyling the `loading={true}` skeleton rows or its Loading status.
