# Tasks

## 1. Implementation

- [x] 1.1 Add a shared character-count hook and counter part.
- [x] 1.2 Integrate showCount, maxCount and countStrategy into Textarea and Input.
- [x] 1.3 Add English and Spanish catalog strings, including unlimited count descriptions.
- [x] 1.4 Rewrite TextareaCounter and add InputCounter live examples.

## 2. Tests

- [x] 2.1 Cover hard/soft limits, byte counts, clear controls, Field descriptions, localization, SSR and unchanged default DOM.
- [x] 2.2 Cover debounced warning/over-limit announcements, silent mount, normal and unlimited zones, and timer cleanup.
- [x] 2.3 Check example accessibility in all three themes using jsdom axe.
- [ ] 2.4 Run browser a11y and color contrast in PR CI (worker policy excludes browser suites).

## 3. Docs and release

- [x] 3.1 Document all counter props and add one minor changeset for @gntik-ai/ui.
- [x] 3.2 Regenerate the kit registry and related artifacts.
- [x] 3.3 Run bounded repository checks and strict OpenSpec validation, then commit locally.

## Test seams and decisions

Tests use rendered public Input and Textarea controls, accessible descriptions, visible counters and polite regions. A default-DOM snapshot was captured at the assigned base before source changes. Each feature slice failed before its implementation under `pnpm --filter @gntik-ai/ui test src/utils/char-count.test.tsx`: missing hard-limit counter, missing soft-limit state, missing Input counter, missing merged descriptions, then missing live regions. No bug fix is claimed; this is an additive feature.

The unlimited description uses charCount.count with singular/plural branches. New catalog keys extend the existing textarea-messages module already included by both en and es, keeping the large catalog entry files untouched. Textarea's className continues to style only the native control. Moving its counter into a future addon frame is deferred.

## Validation and limits

Library builds, lint (one warning in unchanged forms coverage), typecheck, registry:check, docs coverage, both app kit-only checks, formatting and strict OpenSpec validation pass. The focused counter/SSR command passes 24 tests. A broader focused run of Input, Textarea, counters and Combobox async passes all 85 tests across nine files, including unchanged Input/Textarea clear and autosize coverage.

The CLI, codemods, icons, charts, editor and flow suites pass in the recursive runs. Blocks, chat and templates pass in a separate final run after the recursive command stops at UI.

The full UI run completes with 3,116 passing tests and one real assertion failure in the unchanged Combobox async debounce test at packages/ui/src/components/Combobox/Combobox.async.test.tsx:86: an intermediate query fires during typing. The focused rerun passes that test. The recursive library command excluding tokens also stops at UI. These failures are reported as failures for the base rerun and CI to assess; no unrelated Combobox changes are included.

The requested recursive library command including tokens cannot complete offline. The tokens mirror-install fallback packs the current package version but reads gntik-ai-tokens-0.2.1.tgz, causing ENOENT at packages/tokens/test/mirror-install.test.mjs:93. A focused rerun confirms this environment limitation. Browser a11y/color contrast, MCP CLI tests and evals tests run in PR CI under worker policy. No dependencies, lockfiles or visual baselines change.
