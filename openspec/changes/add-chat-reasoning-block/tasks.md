# Tasks

## Implementation

- [x] Add ReasoningBlock, variants, docs, examples, index and public export.
- [x] Add stream transition settlement, user intent and controlled open handling.
- [x] Add safe streaming Markdown, empty handling and reduced-motion pulse.
- [x] Add ChatAnnouncer reasoning and preserve existing responding/author translation.
- [x] Add en/es catalog keys, chat fallbacks and a separate whole-second formatter.
- [x] Stream a fixture reasoning trace in ChatDemo before the answer.

## Tests

- [x] Write failing tests before implementation at rendered disclosure, status and demo seams.
- [x] Cover labels, empty states, stream transitions, controlled/user choices, Markdown safety and keyboard behavior.
- [x] Cover es catalogs and missing-key English fallbacks.
- [x] Cover unpinned scrolling during collapse and timer cleanup.
- [x] Cover semantic axe on all phases in three themes, including the empty streaming trigger.

## Docs and release

- [x] Add one changeset naming chat and ui with minor bumps.
- [x] Regenerate registries and llms files, then run all required repository gates.
- [x] Validate add-chat-reasoning-block with OpenSpec strict mode.
- [ ] Run browser accessibility and visual suites in PR CI (worker policy).

Validation: library builds, lint, typecheck, registry consistency, docs coverage and both app kit-only checks pass. All library unit suites excluding the token integration pass; the direct chat suite passes 334 tests, with one existing Mermaid integration test skipped because jsdom lacks SVG getBBox. The required aggregate cannot complete the token mirror-install integration without the published tarball: the public registry is unavailable and the offline fallback packs version 0.3.0 but tries to read the pinned 0.2.1 filename (ENOENT before install assertions). That integration is skipped in this sandbox and remains for PR CI. Full apps/MCP/evals tests and browser suites also run in PR CI under worker policy.
