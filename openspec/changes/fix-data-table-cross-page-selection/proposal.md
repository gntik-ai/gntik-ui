# Preserve DataTable selections across server pages

## Why

At 18d8116 the table filters selected ids through the current rows when reporting selection and rendering bulk actions. Server pagination consequently hides earlier selections and bulk actions omit them.

## What changes

Keep server-page selections by default, with preserveSelection=false restoring page-only reporting and a client opt-in. Add include/exclude models, an opt-in select-all-matching strip, disabled multiple-selection rows, hideSelectAll and paginated single selection. Exclude models reset on changed filters, while page, size and sort changes retain them. Add localized en/es labels and live docs examples.

## Impact

Patch @gntik-ai/blocks and its shared @gntik-ai/ui catalogs. Server reporting widens to selected ids from other pages; the changeset documents the opt-out. Consumers execute exclude actions and supply all narrowing inputs through filters. No deployment, range selection, shared selection hook, floating toolbar or virtualized single selection is included.
