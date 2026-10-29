# DataTable server sorting and query changes

## Why

Server pagination removes sortable headers and ignores sort requests. Consumers also have to combine the footer's page-size and page callbacks to fetch once.

## What Changes

- Keep sortable server headers when onSortChange or onQueryChange handles sorting, without reordering supplied rows.
- Request page 1 on a server sort change, including changed saved-view sorts.
- Export DataTableQuery and emit one synchronous onQueryChange per page, page-size, sort or view action in both pagination modes.
- Document the callback contract and update the server example, tests and generated registry.

## Impact

- Capability: blocks/data-table (ADDED; no baseline spec).
- Risk R1: server tables already passing onSortChange now show sort buttons for sortable columns; the minor blocks changeset records this.
- No PaginationFooter API changes, fetching infrastructure, filter model, multi-column sorting or unsorted cycle step.
- Sort changes always request page 1. A view changing only filters keeps the current server page. Clearing sort is reported through onQueryChange with sort null.
- Consumers should fetch through onQueryChange or the separate callbacks to avoid duplicate requests, and reset controlled sort on failure.
- Roll back by reverting or pinning the previous library release. No deployment or publication.
