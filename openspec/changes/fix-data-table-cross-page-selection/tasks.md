# Tasks

## 1. Implementation

- [x] 1.1 Preserve cross-page ids behind preserveSelection and expose include/exclude selection models and hideSelectAll.
- [x] 1.2 Add the select-all-matching strip, filter reset and en/es labels with per-table overrides.
- [x] 1.3 Apply isRowDisabled to multiple selection and allow paginated single selection.
- [x] 1.4 Document model semantics and add interactive client/server selection examples.

## 2. Tests

- [x] 2.1 Observe the server-page regression fail at 18d8116, then cover preservation, models, matching selection and filter resets through the public DOM and callbacks.
- [x] 2.2 Cover disabled rows, hidden select-all and radio pagination; keep legacy client selection coverage unchanged.
- [x] 2.3 Verify locale formatting and label overrides.
- [x] 2.4 Add browser axe coverage for the updated examples in all three themes.
- [ ] 2.5 Run browser axe in PR CI; the sandbox refuses the preview listener with EPERM at ::1:4173.

## 3. Docs and release

- [x] 3.1 Add one patch changeset naming blocks and the shared UI catalogs, including preserveSelection=false as the reporting opt-out.
- [x] 3.2 Regenerate the kit registry, shadcn entries and llms output.
- [x] 3.3 Validate this change with OpenSpec strict mode.

## 4. Checker follow-up

- [x] 4.1 Reproduce the absent mounted announcement region; route strip announcements through the persistent toolbar region, including when the toolbar controls or selection summary are hidden. Keep the non-live toolbar count available for screen reader browsing.
- [x] 4.2 Reproduce focus falling to document.body after Clear; restore focus before unmounting, using the page checkbox or the table when the checkbox is unavailable. Cover keyboard continuation through the table.
- [x] 4.3 Reproduce the unnecessary server strip on a fully loaded page with a disabled row; compare the server total with supplied rows instead of enabled page ids.
- [x] 4.4 Explain server counts and unloaded-row eligibility in the docs; test loaded disabled exclusions and count preservation across pages.
- [x] 4.5 Remove unused disabledIds utility parameters; page and group callers already filter disabled ids.

## Follow-up reproduction evidence

Before each fix, public DOM/keyboard tests went red using `pnpm --filter @gntik-ai/blocks test src/tables/DataTable/DataTable.cross-page-selection.test.tsx` with these name filters:

- `-t 'announces matching selection'`: no polite region existed before the first selection. The strip mounted a separate populated region while the toolbar announced the count independently.
- `-t 'focus when clearing|focus to the table'`: Clear unmounted its focused button and focus fell to document.body, both with and without the page checkbox.
- `-t 'all rows are loaded'`: the strip offered Select all 20 rows after selecting the 19 enabled rows of a complete server page. It compared the total against enabled page ids.

The follow-up retains the original base-regression evidence below. Browser axe and the tokens mirror-install integration remain PR CI checks because this sandbox refuses local listeners; no test timeout was added.

## Follow-up validation

- PASS: all ten remaining library package suites using the recursive test command excluding tokens, MCP and evals, including the full UI, blocks and templates suites.
- PASS: all nine DataTable suites (123 tests), including 18 cross-page selection tests and semantic axe checks in dark, light and high_contrast.
- PASS: all library package builds, monorepo lint and typecheck, registry generation/check, docs coverage, both consumer kit-only checks and strict OpenSpec validation.
- PASS: the four token suites that do not require a listener (density, export, motion and tokens).
- SKIPPED: the prescribed recursive library test command stops in tokens/mirror-install because the sandbox rejects `listen` on `127.0.0.1` with EPERM. A direct run of the unchanged mirror-install suite confirmed this environment error.
- SKIPPED: `pnpm a11y` cannot start its preview server. Running preview directly confirmed `listen EPERM: operation not permitted ::1:4173`. Browser axe remains an unchecked PR CI task; the cross-page suite runs semantic axe over the examples in all three themes.
- Full application builds and the MCP/evals test suites remain PR CI checks under the supplied sandbox policy.

## Original implementation evidence

The public cross-page regression failed at base 18d8116 with `pnpm --filter @gntik-ai/blocks test src/tables/DataTable/DataTable.cross-page-selection.test.tsx`: selecting rows 1 and 2 and passing page 2 removed the toolbar count and bulk action. Reporting intersected the stored selection with the current rows. The final cross-page suite passes 13 tests, including semantic axe checks for all new examples in dark, light and high_contrast. Legacy client selection coverage remains unchanged and passes.

All library builds, lint, full monorepo typecheck, docs build/tests, registry checks, consumer kit-only checks and strict OpenSpec validation pass. The recursive library tests stop at the tokens mirror-install test because the sandbox refuses its loopback listener (`listen EPERM: operation not permitted 127.0.0.1`). The other four token test files pass. A separate recursive run excluding tokens, MCP and evals passes all ten remaining library packages, including UI, blocks and templates.

Browser axe cannot start the docs preview server (`listen EPERM: operation not permitted ::1:4173`); the added browser suite must run in PR CI for contrast and browser interaction coverage. Full monorepo tests, MCP/evals tests and application builds remain CI checks. No safety gates, workflows or visual baselines changed. Registry generation updates kit-registry.json, llms-full.txt and embedded source catalogs; registry.json and llms.txt regenerate without changes.
