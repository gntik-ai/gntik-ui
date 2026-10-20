# Tasks

## 1. Implementation

- [x] 1.1 Export `escapeCsvCell` with TSDoc from audit-log/Page.tsx; prefix the six first-character triggers before the existing quoting rule.
- [x] 1.2 Document the escaping in template.meta.ts's description.

## 2. Tests

- [x] 2.1 Reproduce the quoted actor formula and each trigger in the target column at base 7ddce300 before changing source.
- [x] 2.2 Cover safe names, IPs, commas, quotes, newlines, embedded triggers, leading spaces and empty values; keep the existing filter/CSV test unchanged.
- [x] 2.3 Run scoped tests and required repository checks; record environment limitations.

## 3. Docs and release

- [x] 3.1 Add one changeset with a patch for `@gntik-ai/templates`.
- [x] 3.2 Regenerate registry output and check for drift.
- [x] 3.3 Validate the OpenSpec change in strict mode.

## Validation evidence

At the immutable base 7ddce300, `pnpm --filter @gntik-ai/templates test src/audit-log/Page.test.tsx -t auditEventsToCsv` failed twice with seven assertions: the quoted HYPERLINK actor and all six target triggers lacked the apostrophe. Eight safe-value controls passed. The seam is the real `auditEventsToCsv` output, using one event per case and literal expected cells/rows.

The confirmed cause is the old `csvCell` helper, which only quotes commas, double quotes and newlines. Quoting does not neutralise spreadsheet formula triggers. The fix prefixes the value before quoting, without trimming or stripping characters.

The final focused audit-log run passes all 19 tests, including the original filter/CSV test and rendered semantic axe check. Library builds, lint, monorepo typecheck, registry drift, docs coverage, both consumer kit-only checks, changed-file formatting and strict OpenSpec validation pass.

The required recursive library test command stops at the token mirror-install test because the sandbox refuses its loopback server (`listen EPERM` on `127.0.0.1`). The four other token test files pass separately. Browser `pnpm a11y` cannot start its preview because `apps/docs/dist` is absent. PR CI must complete the mirror-install test and browser accessibility checks. Full monorepo tests, MCP/evals tests and app builds remain in PR CI under the standing sandbox policy.

All ten remaining library packages pass the recursive run with tokens excluded: `pnpm -r --filter './packages/**' --filter '!@gntik-ai/gntik-ui-mcp' --filter '!@gntik-ai/evals' --filter '!@gntik-ai/tokens' test`, including the complete UI, blocks and templates suites.
