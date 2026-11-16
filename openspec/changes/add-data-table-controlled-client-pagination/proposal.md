# Controlled client pagination and automatic page sizing

## Why

Client DataTable pagination cannot restore a shared URL or browser history because its page and page size are internal state.

## What Changes

- Add client page/onPageChange, defaultPage, pageSize/onPageSizeChange through the existing useControllable helper. Keep rowCount exclusive to server mode.
- Request resets once for sorting and saved views, clamp stale pages for display without callbacks, and retain complete onQueryChange payloads.
- Add autoPageSize for a definite-height parent, measuring the body viewport independently of row count, preserving the first visible row and falling back to defaultPageSize without a definite height.
- Add PaginationFooter showPageSize (default true), URL and automatic-sizing examples, docs, tests and generated registry output.

## Impact

- ADDED capabilities: blocks/data-table and blocks/pagination-footer. No baseline specs exist.
- R1, additive client props, minor @gntik-ai/blocks changeset. Server mode and single-selection pagination rules remain unchanged.
- No URL-state hook, pagination placement, persistence, deployment or release changes. Roll back by reverting or pinning the previous package version.
