# Change: Add expandable DataTable detail rows

## Why

Inline payloads, errors and logs retain list scroll position and selection during drill-down.

## What Changes

- Add opt-in renderDetail, hasDetail and controlled or uncontrolled detail ids.
- Add single or multiple expansion, optional row-click activation, localized accessible toggles and lazy full-width regions.
- Preserve grouping, selection and column pinning; disable virtualization for detail tables.
- Document live payload and error examples and release the additive blocks API in a minor version.

## Impact

- Affected specs: blocks/data-table (ADDED requirements; no baseline).
- Affected code: DataTable, column sizing, UI catalogs, docs and generated registries.
- No new dependencies; tables without renderDetail retain existing DOM.
- Nested rows, variable-height virtualization, end-position toggles and row activation are out of scope.
