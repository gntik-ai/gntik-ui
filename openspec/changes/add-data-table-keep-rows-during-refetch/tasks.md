# Tasks

## 1. Implementation

- [x] 1.1 Widen `loading` to `boolean | 'refresh'` and keep rows, the footer, the header checkbox and virtualization during `'refresh'`, with the kit `Progress` overlaid on the body.
- [x] 1.2 Track table-emitted requests to decide the announcement; add `table.updating` to the en and es catalogs and `updating` to labels.ts and block.meta.ts.
- [x] 1.3 Add `noResultsState` and `filtered` to the empty branch of data-table-body.tsx, and examples/refresh-loading.tsx.

## 2. Tests

- [x] 2.1 Add DataTable.refresh.test.tsx: rows and footer kept, `aria-busy` and progressbar, announcement after a request but not for a poll, empty fallback, usable controls, virtual window kept, empty-state choice and unchanged `loading={true}`.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/blocks` and `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-data-table-keep-rows-during-refetch --strict`.
