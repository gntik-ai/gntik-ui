# Tasks

## 1. Implementation

- [x] 1.1 Add DownloadButton, downloadFile, toCsv, escapeCsvCell, variants and public exports.
- [x] 1.2 Add download.label and download.failed to the English and Spanish catalogs.

## 2. Tests

- [x] 2.1 Test typed downloads, deferred URL revocation, pending state/repeats, rejection announcements, missing object URL support and keyboard activation.
- [x] 2.2 Test RFC 4180 quoting, CRLF/LF, BOM, delimiters, headers, every formula trigger and typed values. Mirror the audit-log fixture locally, documenting CR quoting.
- [x] 2.3 Run axe on every example in dark, light and high_contrast in jsdom; browser contrast/a11y runs in PR CI.

## 3. Docs and release

- [x] 3.1 Add docs, static CSV, async success/failure and JSON examples, and a minor @gntik-ai/ui changeset.
- [x] 3.2 Regenerate the registry and run scoped repository checks (offline token mirror installation and browser suites remain CI checks).
- [x] 3.3 Validate this OpenSpec change with --strict.
