# Tasks

## 1. Implementation

- [x] 1.1 Add EditableText, variants, docs, examples, keyboard/axe tests and public exports.
- [x] 1.2 Extract and export useInlineEdit with parsing and after-move support; migrate EditableCell without changing its markup or public contract.
- [x] 1.3 Add English/Spanish editableText messages in a separate module.

## 2. Tests

- [x] 2.1 Test activation, selection, async results, validation, trimming, cancellation, unchanged values, blur focus, multiline keys, controlled state and maxLength at the rendered component seam, red before green.
- [x] 2.2 Run existing DataTable tests unchanged and PageHeader title accessibility coverage.
- [x] 2.3 Run axe on live examples in dark, light and high_contrast in jsdom; browser contrast/a11y runs in PR CI.

- [x] 2.4 Preserve focus after cancelling a pending DataTable cell save; reproduce the callback-identity regression before correcting the shared focus effect.

## 3. Docs and release

- [x] 3.1 Add one changeset: minor UI, patch blocks.
- [x] 3.2 Regenerate and commit registry and llms output.
- [x] 3.3 Run scoped library build/tests, lint, typecheck, registry:check, kit-only checks and docs coverage.
- [x] 3.4 Validate the OpenSpec change with --strict.

## Worker validation limits

- The aggregate library command cannot complete without network: tokens' mirror-install setup falls back to packing version 0.3.0, then expects gntik-ai-tokens-0.2.1.tgz and raises ENOENT. This is a setup limitation; PR CI must run the mirror check with network.
- Browser a11y/visual suites, Next.js app builds and MCP/evals subprocess suites run in PR CI under the worker contract.
- Final focused checks cover EditableText (31 tests), unchanged DataTable tests plus pending-cancel compatibility, and PageHeader in three themes (173 tests).
