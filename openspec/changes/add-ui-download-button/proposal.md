# Add shared file downloads and safe CSV serialization

## Why

Consumers currently implement their own export behavior. A shared serializer gives future exports consistent RFC 4180 quoting and spreadsheet formula protection, and a shared button provides accessible pending and failure states.

## What Changes

- Add DownloadButton, downloadFile, toCsv and escapeCsvCell to @gntik-ai/ui.
- Add English and Spanish download messages, live examples and keyboard/axe tests.
- Regenerate the kit registry and record a minor package release.

## Impact

- Affected specs: ui/download-button (ADDED).
- Affected code: packages/ui and generated documentation/registry artifacts.
- Risk R2: formula protection is a CSV-injection control. Text beginning with + or - gains an apostrophe; numeric values do not. Disabling escaping is unsafe for spreadsheets.
- No template migration, streaming, extension inference, deployment or publishing. BOM remains opt-in. Roll back by reverting or pinning the previous kit version.
