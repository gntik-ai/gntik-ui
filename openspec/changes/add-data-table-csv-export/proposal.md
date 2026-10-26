# DataTable CSV export and selected-row clipboard

## Why

Tables need safe, consistent exports without repeating CSV quoting and spreadsheet formula protection in consumers. The shared UI serializer and download/clipboard helpers already exist.

## What Changes

- Add opt-in csvExport with all, page and selected scopes, visible raw columns, exportValue and exportable.
- Delegate CSV exports through onExport, including server pagination, with a pending lock.
- Copy selected rows as escaped TSV from the menu or Ctrl/Cmd+C outside editors and document text selections.
- Add English/Spanish labels, override keys, live examples, accessibility tests and a minor blocks changeset (UI catalog patch).

## Impact

- Capability: blocks/data-table (ADDED; no baseline spec).
- Risk R2: every file and clipboard path uses shared toCsv formula protection, including headers and exportValue.
- Depends on add-ui-download-button. No changes to its helpers, template migrations, server export jobs or additional formats.
- Roll back by reverting or pinning the prior library version. No deployment, publishing or merging.

## Decisions

- Single selection exports and copies selectedId.
- Server All rows uses rowCount; delegated selectedIds preserves the table's reported selection. Clipboard data can only resolve supplied rows.
- Missing caller caption and fileName use table.csv; supplied captions are slugged. nullish exportValue falls back to accessor.
- Consumers handle delegated errors; the pending lock releases on both success and rejection.
