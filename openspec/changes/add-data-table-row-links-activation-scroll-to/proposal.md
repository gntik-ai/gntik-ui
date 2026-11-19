# DataTable row links, activation and scrolling

## Why

Lists repeat identifying-cell links, but plain row cells cannot activate those links. There is no public handle to reveal a listed row across pages, collapsed groups or virtual windows.

## What Changes

- Add getRowHref, onRowClick, onRowDoubleClick and selectOnRowClick. Keep the row-header control as the accessible keyboard path, share interactive-target protection with detail rows, and warn once when activation overrides selection or detail clicks.
- Export DataTableHandle and ScrollToRowOptions. Reveal listed rows with instant scrolling, optional focus, client page requests and group expansion; never fetch server pages.
- Migrate resource-index to the DataTable API, preserving its public callback signature.
- Add regression tests, translated live examples, docs, changeset and generated registry output.

## Impact

- ADDED capability: blocks/data-table; no baseline specification exists.
- R1 additive optional API. No new focus stop or DOM change without the new props.
- Minor @gntik-ai/blocks, patch @gntik-ai/templates and @gntik-ai/ui (example translations).
- Highlights, row tones, range selection, grid keyboard activation and server fetching remain out of scope. Roll back by reverting the change or pinning the previous package version.
