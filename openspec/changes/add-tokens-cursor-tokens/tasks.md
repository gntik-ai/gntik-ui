# Tasks

## 1. Implementation

- [x] Add cursor.css, its package export and the two Tailwind utilities.
- [x] Migrate UI cursor classes, add Button hover guards and restore disabled pointer events.
- [x] Remove the catalog button cursor rule.

## 2. Tests

- [x] Add token, source policy, class merging and disabled/loading Button tests.
- [x] Regenerate affected snapshots with the test runner and verify class-only changes.
- [x] Add a computed cursor, disabled hover and three-theme axe browser check for PR CI.

## 3. Docs and release

- [x] Document and demonstrate the cursor policy override.
- [x] Add a minor changeset for tokens and UI.
- [x] Regenerate the registry and run the bounded repository checks.
- [x] Run OpenSpec strict validation.
- [ ] PR CI: run the browser suites and rerun mirror-install with registry access (the offline fallback could not find its pinned 0.2.1 tarball).
