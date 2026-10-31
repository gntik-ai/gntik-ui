# Tasks

## 1. Implementation

- [x] 1.1 Add a filtered model retaining original node objects, matching branches' subtrees and ancestor ids.
- [x] 1.2 Add filter and filterNode, isolated expansion, visible-only select-all and focus fallback; preserve the unfiltered memo.
- [x] 1.3 Share highlighting, add status/empty results, href/currentHref link treeitems and Collapsible groups.
- [x] 1.4 Add English/Spanish messages and file filtering/navigation examples with documentation.

## 2. Tests

- [x] 2.1 Cover visibility, expansion restoration, selection, keyboard, accents, custom matchers, localized status and no matches.
- [x] 2.2 Cover LinkProvider navigation, disabled click variants and original callback object identity.
- [x] 2.3 Cover transition states, inert closing contents, reduced motion, flatten count and baseline JsonViewer DOM.
- [x] 2.4 Add example axe checks in three themes; browser suites run in PR CI.
- [ ] 2.5 Operator NVDA and VoiceOver checks before release.

## 3. Docs and release

- [x] 3.1 Add one minor @gntik-ai/ui changeset.
- [x] 3.2 Regenerate the registry and run bounded repository checks.
- [x] 3.3 Run strict OpenSpec validation.

## Validation limits

- Browser axe/visual suites run in PR CI; the focused TreeList browser spec is included for that runner.
- NVDA and VoiceOver remain operator release checks.
- The tokens mirror-install test cannot complete without registry access: its offline fallback expects a 0.2.1 tarball, while this snapshot's local tokens package is 0.3.0 (ENOENT). Other library suites run separately.

## Review follow-up

- Move group motion from global ARIA selectors to transition-only component token classes, shipped in both docs and registry source. Resting group markup stays unchanged.
- Add CSS compilation checks for both distribution paths, alongside the Base UI transition lifecycle tests.
- Scope disabled-link capture handlers to the anchor so enabled descendants remain clickable; reproduce the failure before fixing it.
- Seed the JsonViewer DOM snapshot from base commit `1aacf7b2a6fb945ffb785a11372de99c4809afd9`, including a collapsed nested branch, then compare the implementation without updating the snapshot.
- Intentionally retain the acceptance criterion's first-visible focus fallback during filtering; document and test it even when a later visible node is selected.
- Style the no-matches message with the component's empty-state token slot and document the Base UI measurement lifecycle used to preserve resting markup.
