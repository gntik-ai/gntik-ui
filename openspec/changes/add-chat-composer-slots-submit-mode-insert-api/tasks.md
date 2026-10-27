## 1. Implementation

- [x] Add optional slots, submit mode, read-only state, text actions and ChatComposerHeader.
- [x] Use useOs and English/Spanish catalogs with English fallbacks.
- [x] Document keyboard contracts, controlled caret timing and text-only clear; add live examples.

## 2. Tests

- [x] Preserve the default DOM and existing tests; cover keyboard modes, IME, hints, controlled/uncontrolled actions, read-only behavior and slot order.
- [x] Add axe tests in all three themes and browser coverage for contrast and LTR/RTL prefix placement (browser suites run in PR CI).

## 3. Release evidence

- [x] Add one changeset for chat minor and ui patch.
- [x] Regenerate registries and run bounded repository checks and strict OpenSpec validation. Full UI and chat suites passed. The supplemental library run was stopped at its 20-minute worker budget with blocks still running and templates not started; PR CI must finish them. The tokens mirror-install integration check requires PR CI: offline fallback expects a 0.2.1 tarball while the current package packs as 0.3.0.
