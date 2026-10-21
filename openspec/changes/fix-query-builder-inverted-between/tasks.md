# Tasks

## Implementation

- [x] Add and export isConditionValid; ignore invalid conditions during evaluation without changing completeness or queryToString.
- [x] Link both number/date inputs to a stable translated inline error and preserve their values.
- [x] Add the en/es catalog entries and document backend validation.

## Tests

- [x] Reproduce the empty-result bug before changing source with the public evaluateQuery helper.
- [x] Add regression coverage for number/date ordering, equal bounds, incomplete and other values, nested AND/OR groups, editor descriptions and corrections; observe failures before their fixes.
- [x] Add semantic axe checks and browser axe coverage in dark, light and high_contrast for the invalid range example.
- [x] Run bounded repository checks and record environment limitations in the implementation result.

## Docs and release

- [x] Add a live invalid number/date range example.
- [x] Add one patch changeset for @gntik-ai/ui.
- [x] Regenerate the registry and check for drift.
- [x] Validate this change with openspec --strict.

## Validation evidence

At base e1aab68, `pnpm --filter @gntik-ai/ui test src/components/QueryBuilder/query.test.ts` reproduced the bug: the public evaluator returned no records for amount [10, 5], instead of all three records. Filled pairs pass completeness, so the evaluator applied an impossible inclusive intersection. The number and controlled date editor regressions also failed before the editor fix because both controls lacked aria-invalid. Restoring only query.ts and QueryValueEditor.tsx to their exact base contents makes 20 regressions fail; restoring the verified fixed files makes all 61 tests pass. The fixed focused suite includes semantic axe checks in all three themes (jsdom excludes colour contrast).

Library builds, lint, monorepo typecheck, strict OpenSpec validation, registry drift, docs coverage and both consumer kit-only checks pass. Generated shadcn entries embed en/es catalogs, explaining their shared catalog updates; registry.json is regenerated but unchanged.

The required recursive library tests stop at tokens' mirror-install test: the sandbox refuses its loopback listener with `listen EPERM: operation not permitted 127.0.0.1`. The other four token test files pass. A separate recursive run excluding tokens, MCP and evals passes all ten remaining library packages, including the complete UI, blocks and templates suites. Browser `pnpm a11y` cannot start because apps/docs/dist is absent. PR CI must run browser axe/contrast checks in dark, light and high_contrast, along with the full monorepo tests, excluded MCP/evals tests and application builds. No visual baselines or safety gates were changed.
