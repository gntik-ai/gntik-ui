# Add command palette async results

## Why

CommandPalette only ranks the static groups it is given, keeps the query private and cannot load server results, show a loading or error state, retry, cap a large list, customise a row or be opened from code. GlobalSearch passes preloaded groups only, so the topbar ⌘K search cannot find agents, runs, functions or tenants that live on the server.

## What changes

Add optional `loadItems`, `debounceMs` (default 250), `minQueryLength` (default 1), `loadingText`, `errorText`, `onQueryChange`, `filter`, `limit`, `renderItem` and `store` to CommandPalette, reusing `useAsyncOptions`. Loaded groups render after the static groups in the order returned, de-duplicated by id. Pending loads set `aria-busy` and show a Loading status; failures show an error status and a last Retry option. `filter` replaces the built-in scorer (also for the empty query), `limit` cuts static rows and the footer reads `Showing n of total`, `renderItem` replaces the row content inside the option, and `createCommandPaletteStore` opens and closes the palette from code.

GlobalSearch forwards `loadItems`, `debounceMs`, `minQueryLength`, `onQueryChange` and `store` and reports a chosen loaded item as `records`. Add a live GlobalSearch server-search example and the CommandPalette async and custom-row examples. Release a minor of @gntik-ai/ui and @gntik-ai/blocks.

## Scope and risk

R1, additive optional props on a beta component; with none set, the DOM is unchanged. No virtualisation, paging, caching, search API, inline palette, fuzzy-search dependency or Dialog detached-trigger handle. Roll back by reverting or pinning the previous releases. No deployment step.
