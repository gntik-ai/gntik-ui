# DataTable row editing, typed editors and row actions

## Why

Cell editing cannot save a row or several rows together. InlineEditTable lacks DataTable sorting, selection and pagination. Consumers need validated row drafts that persist across pages and virtualization.

## What Changes

- Add opt-in row editing, controlled editing ids, validation and field/row rejection feedback.
- Add textarea, switch, date, combobox and custom editors without widening edit values.
- Add save-all/discard-all, one new-row draft and confirmed deletion on existing kit blocks.
- Deprecate InlineEditRow and InlineEditTable without removing their exports.
- Document live row, cell, virtualized and form-array examples; translate chrome into English and Spanish.

## Impact

- Capability: blocks/data-table; all requirements are ADDED because no baseline exists.
- Public packages: minor @gntik-ai/blocks; patch @gntik-ai/ui for additive catalog entries.
- No new dependencies. Existing cell defaults and callback signatures remain compatible.
- No deployment. Roll back by reverting or pinning the previous package release.
