# Tasks

## 1. Implementation

- [x] 1.1 Add useClipboard and export it from @gntik-ai/ui.
- [x] 1.2 Rebuild CopyButton on the hook with its existing public contract.
- [x] 1.3 Route all eight scoped copy affordances through the shared clipboard path.
- [x] 1.4 Add the row-menu docs example with optional announcements.
- [x] 1.5 Add one linked changeset for the four published packages.

## 2. Tests

- [x] 2.1 Cover hook state, fallback, getters, lifecycle, races and announcements.
- [x] 2.2 Cover consumer fallback and failure paths and retain CopyButton tests unchanged.
- [x] 2.3 Check menu focus restoration and jsdom axe in all three themes.
- [ ] 2.4 Run browser accessibility suites in PR CI.

## 3. Docs and release

- [x] 3.1 Add TSDoc, hook metadata and a live catalog example.
- [x] 3.2 Regenerate registry and llms output.
- [x] 3.3 Run repository checks and strict OpenSpec validation, recording sandbox limits.

## Validation handoff

- Final scoped tests cover the hook, unchanged CopyButton tests, menu focus and announcements, all eight copy affordances, chat compatibility and overlapping disclosure callbacks.
- The full library unit command stops in the tokens mirror-install harness without registry access: its offline fallback expects gntik-ai-tokens-0.2.1.tgz, which is unavailable (ENOENT). Re-run with network in PR CI.
- Browser accessibility and visual suites, app builds, MCP CLI tests and evals remain for PR CI under the worker rules.
