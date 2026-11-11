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

## Follow-up review

Verified the clean assigned worktree at f065b392 on the issue 180 branch. Review found no additional runtime defect. Extended the public-control tests for both Input and Textarea to cover typing beyond a soft limit, including the accessible count description, and silent mounting with a prefilled warning-zone value. These acceptance tests pass against the existing implementation; this follow-up changes only tests and validation notes. The focused counter and SSR run passes all 28 tests. The existing minor changeset and generated registry remain intact.

## Validation and limits

Library builds, lint (one warning in unchanged forms coverage), typecheck, registry:check, docs coverage, both app kit-only checks, formatting and strict OpenSpec validation pass. The focused counter and SSR command passes all 28 tests. The full UI suite passes all 3,121 tests across 293 files, including unchanged Input/Textarea clear and autosize tests and the previously intermittent Combobox async test. Example axe checks pass in jsdom for dark, light and high_contrast; browser accessibility and color contrast remain assigned to PR CI.

The CLI, codemods and icons suites pass in the requested recursive library run before it stops at tokens. Charts, editor, flow, chat, blocks and templates all pass in the supplemental library run.

The requested recursive library command cannot complete offline. The unchanged tokens mirror-install fallback packs the current 0.4.0 version but reads gntik-ai-tokens-0.2.1.tgz, causing ENOENT at packages/tokens/test/mirror-install.test.mjs:93. A focused rerun and direct diagnostic confirm this environment limitation. The tokens suite alone confirms that its other 17 test files pass; commands stopped by the mirror-install environment error are reported as SKIPPED. Browser a11y/color contrast, MCP CLI tests, evals tests and Next.js app builds run in PR CI under worker policy. No dependencies, lockfiles or visual baselines change.
