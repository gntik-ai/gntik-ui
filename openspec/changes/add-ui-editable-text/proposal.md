# Add EditableText and shared inline editing

## Why

Inline renaming currently lives inside DataTable. Names and page titles need the same accessible activation, async saves, cancellation and error feedback without copying the table implementation.

## What Changes

- Add EditableText to @gntik-ai/ui with click, double-click and icon-button activation, single-line and multiline editors, validation, trimming and controlled or uncontrolled value/editing.
- Export the low-level useInlineEdit hook and EditableSaveResult contract. Move EditableCell onto the hook while preserving its public props, DOM, parsing, labels, GENERIC_ERROR fallback and self/next/prev/null focus moves.
- Add English/Spanish messages in a separate module, keyboard and axe coverage, live examples including PageHeader, and generated registry output.
- Record a minor UI release and a patch blocks release in one changeset.

## Impact

- ADDED capability: ui/editable-text. No baseline specs or dependencies.
- Risk R1: additive API; unchanged DataTable tests gate the shared-state extraction.
- submitOnBlur defaults to true to match DataTable; false cancels half-typed values on blur.
- No row editing, spreadsheet keys, rich text, undo, optimistic updates, conflicts or PageHeader/CanvasLayout prop changes.
- No deployment or publishing. Rollback: revert this ChangeSet or pin the previous UI and blocks releases.
