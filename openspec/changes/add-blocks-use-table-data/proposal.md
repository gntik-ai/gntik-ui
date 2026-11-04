# Add useTableData for server tables

## Why

Server-mode tables currently require consumers to implement request cancellation, stale-result guards, caching and retry independently.

## What changes

- Export an additive useTableData hook and its request, response, option and result types from @gntik-ai/blocks.
- Map committed page, size, sort and JSON-value filter changes to one abortable request, with per-instance TTL caching, retained rows, errors and foreground revalidation.
- Support accumulated cursor pages through LoadMoreFooter, atomic settles and retry of the failed cursor.
- Rewrite the numbered-page example, add a cursor preview and document the npm-only hook, limitations and endpoint adapters.
- Add a minor blocks changeset and regenerate registries and catalog text.

## Scope and risk

R1, additive API. Depends on add-data-table-server-side-sorting-server-pagination, already present at the assigned base. Capability: blocks/hooks/use-table-data; all requirements are ADDED. No runtime dependency, shared cache, optimistic updates, template migration or runtime changes to DataTable or its footers. No registry generator changes. No deployment, publication or merge. Roll back by reverting or pinning the previous blocks release.
