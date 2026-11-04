# Change: Add useUrlState and opt-in resource-index URL state

## Why

List query, filters and sort are lost on reload or when sharing a resource-index link. The kit has no typed query state API; FilterBar and DataTable already accept controlled state.

## What changes

- Add useUrlState, urlParam codecs and UrlStateProvider to the UI root and hooks entry, with router-independent adapters.
- Share optimistic snapshots per adapter, throttle history writes, preserve foreign keys and hashes, and restore state on navigation.
- Add syncUrl (default false) to resource-index for q, repeated f=field:value and sort=column:asc|desc.
- Document server behavior, adapter lifetime, router recipes and limitations; add accessible live previews.
- Add one minor changeset for @gntik-ai/ui and @gntik-ai/templates and regenerate registry output.

## Scope and risk

Issue #139, R1, additive and opt-in. No new dependencies. Page/page-size control, server fetching, router dependencies, history patching and saved-view IDs in the URL are out of scope. Default-adapter SSR initially shows defaults. Routers need memoized adapters. FilterBar's saved-view Select may remain stale after Back; only query, filters and sort are synchronized. Rollback is a revert or a previous release pin. No publication or deployment.
