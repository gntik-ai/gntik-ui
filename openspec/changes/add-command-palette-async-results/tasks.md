# Tasks

## 1. Implementation

- [x] 1.1 Add `loadItems`, `debounceMs`, `minQueryLength`, `loadingText`, `errorText`, `onQueryChange`, `filter`, `limit`, `renderItem` and `store` to CommandPalette, reusing `useAsyncOptions` and a Status part with `Spinner`.
- [x] 1.2 Add the optional scorer and the limit to `filterCommandGroups`; add `createCommandPaletteStore` and export it.
- [x] 1.3 Add `commandPalette.loadFailed` and `commandPalette.showing` in a new messages module (en and es).
- [x] 1.4 Forward the new props from GlobalSearch and report loaded items as `records`.
- [x] 1.5 Add a Retry row to the CommandPalette keyboard table, the CommandPaletteAsync and CommandPaletteCustomRows examples, and a GlobalSearch ServerSearch example.

## 2. Tests

- [x] 2.1 CommandPalette.async.test.tsx: debounce, `minQueryLength`, abort on query change and on close, loading and error states, Retry, returned order, id de-duplication, `onQueryChange`, store state while the selection callbacks run.
- [x] 2.2 CommandPalette.test.tsx and command-filter.test.ts: custom `filter` (including the empty query), `limit` footer text, `renderItem` keyboard contract, store open/close and Ctrl+K, axe on the loading and error states.
- [x] 2.3 GlobalSearch.test.tsx: a loaded item is reported as `records`, also when a hidden static item shares its id; axe on the ServerSearch example.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui` and `@gntik-ai/blocks`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-command-palette-async-results --strict`.
