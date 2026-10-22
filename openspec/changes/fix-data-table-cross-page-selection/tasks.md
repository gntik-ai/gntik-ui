# Tasks

## Implementation

- [x] Preserve cross-page ids behind preserveSelection and expose include/exclude selection models.
- [x] Add the select-all-matching strip, filter reset and en/es labels with per-table overrides.
- [x] Apply isRowDisabled to multiple selection, add hideSelectAll and allow paginated single selection.
- [x] Document model semantics and add interactive client/server selection examples.

## Tests

- [x] Observe the server-page regression fail at 18d8116 before changing source.
- [x] Add public DOM/callback tests for preservation, models, disabled rows, hidden select-all and radio pagination; observe each new behavior fail before implementation.
- [x] Verify locale formatting and label overrides.
- [x] Add browser axe coverage for the updated examples in all three themes.
- [ ] Run browser axe in PR CI; the sandbox refuses the preview listener with EPERM at ::1:4173.

## Docs and release

- [x] Add one patch changeset naming blocks and the shared UI catalogs, including preserveSelection=false as the reporting opt-out.
- [x] Regenerate the kit registry, shadcn entries and llms output.
- [x] Finish bounded checks and validate this change with OpenSpec strict mode.

## Validation evidence

The public cross-page regression failed at base 18d8116 with `pnpm --filter @gntik-ai/blocks test src/tables/DataTable/DataTable.cross-page-selection.test.tsx`: selecting rows 1 and 2 and passing page 2 removed the toolbar count and bulk action. Reporting intersected the stored selection with the current rows. The final cross-page suite passes 13 tests, including semantic axe checks for all new examples in dark, light and high_contrast. Legacy client selection coverage remains unchanged and passes.

All library builds, lint, full monorepo typecheck, docs build/tests, registry checks, consumer kit-only checks and strict OpenSpec validation pass. The recursive library tests stop at the tokens mirror-install test because the sandbox refuses its loopback listener (`listen EPERM: operation not permitted 127.0.0.1`). The other four token test files pass. A separate recursive run excluding tokens, MCP and evals passes all ten remaining library packages, including UI, blocks and templates.

Browser axe cannot start the docs preview server (`listen EPERM: operation not permitted ::1:4173`); the added browser suite must run in PR CI for contrast and browser interaction coverage. Full monorepo tests, MCP/evals tests and application builds remain CI checks. No safety gates, workflows or visual baselines changed. Registry generation updates kit-registry.json, llms-full.txt and embedded source catalogs; registry.json and llms.txt regenerate without changes.
