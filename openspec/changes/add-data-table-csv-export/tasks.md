# Tasks

## 1. Implementation

- [x] 1.1 Add csvExport, onExport, export request/options types and column export fields.
- [x] 1.2 Compose the kit Menu and shared CSV/download/clipboard helpers in a small hook and menu.
- [x] 1.3 Add keyboard safeguards, polite copy feedback, English/Spanish i18n and labels overrides.

## 2. Tests

- [x] 2.1 Run failing rendered-table tests before each implementation slice: scopes, columns, delegation, clipboard, keyboard and labels.
- [x] 2.2 Cover all formula triggers in headers, accessors and exportValue for both CSV and TSV.
- [x] 2.3 Add example axe checks in all three themes and a browser suite for PR CI.

- [x] 2.4 Reproduce and fix pending-export keyboard focus loss, partial server clipboard output and accented caption filenames; cover the real inline editor copy guard.

## 3. Docs and release

- [x] 3.1 Add metadata and a reachable live CSV example with client, server delegation and single selection.
- [x] 3.2 Add one changeset: minor blocks and patch UI messages.
- [x] 3.3 Regenerate registry artifacts, validate OpenSpec and run the permitted repository checks.
- [ ] 3.4 Run browser accessibility and visual suites in PR CI (worker policy).
