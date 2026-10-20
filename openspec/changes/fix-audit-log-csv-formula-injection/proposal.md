# Fix audit-log CSV formula injection

## Why

User-controlled actor names, emails, actions and targets can start with spreadsheet formula triggers. CSV quoting alone leaves these values executable when an administrator opens the exported audit log in a spreadsheet.

## What changes

Export `escapeCsvCell` from the audit-log Page module and use it in `auditEventsToCsv`. Prefix an apostrophe only when the first character is `=`, `+`, `-`, `@`, U+0009 or U+000D, then apply the existing CSV quoting. Preserve whitespace, safe cells, column order, header, separators and line endings.

Document the escaping in the template description, add regression coverage, regenerate the registry and release a patch for `@gntik-ai/templates`. No root package export, general CSV writer, rendered UI or server-side export changes.

## Impact

Legitimate values beginning with a trigger, including `-1` and `+1`, also receive the apostrophe prefix so spreadsheets treat them as text. This client-only fix has no backend or data changes. Roll back by reverting the change or pinning the previous templates release.
