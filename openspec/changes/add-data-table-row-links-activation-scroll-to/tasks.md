# Tasks

- [x] Add typed row activation props and export the ref handle.
- [x] Render the identifying link/button and share the interactive-target guard with detail rows.
- [x] Support modifiers, cancellation, double click, selection and precedence warnings.
- [x] Reveal rows across client pages, groups and virtual windows with optional focus.
- [x] Migrate resource-index without changing its public props.
- [x] Add activation, scrolling and template regression tests.
- [x] Add translated live examples, metadata and a changeset.
- [x] Run scoped repository validation and regenerate registry.
- [x] Commit the bounded source change locally.
- [ ] PR CI: browser accessibility checks in all three themes.

## Validation handoff

The repair's final one-worker regression run passes all 111 tests across eight DataTable files, including row activation, scrolling, three-theme example axe checks, expandable rows, row headers, link actions, cross-page selection and single selection. The resource-index file passes all 18 tests. The original DataTable child runner also completed with all 438 tests passing after its parent was interrupted. A parallel focused repeat had three failures in untouched cross-page example assertions; that file passed all 19 tests alone and the full 111-test repeat passed with one worker.

Library build, lint (two existing UI warnings), workspace typecheck, registry checks, docs coverage, both kit-only checks and strict OpenSpec validation pass. The recursive library unit gate exits at the untouched CLI package without detailed diagnostics; the direct CLI run passes all 54 tests. The untouched tokens mirror-install test cannot complete offline: its fallback expects gntik-ai-tokens-0.2.1.tgz while the local package is 0.5.0, producing ENOENT. No token assertion is relabelled as passing.

Broad sandbox runs are slow; interrupted parent commands did not immediately stop their child runners. The broad UI child reported a Shiki PostgreSQL alias failure. The configured templates gate has observed failures in untouched sidebar, security and contact tests. The configured templates rerun reproduced those assertion failures before it was interrupted at the worker limit; these remain FAIL. The configured UI rerun did not finish before interruption; the earlier Shiki assertion failure remains FAIL rather than being relabelled SKIPPED. The duplicate broad blocks run was cancelled to reduce worker contention. PR CI must complete the broad suites and browser accessibility checks, and compare unrelated failures at the immutable base. No browser suite was launched on the worker.

## Checker repairs

The rendered DataTable controls are the regression seam. Before the fix, `pnpm --filter @gntik-ai/blocks exec vitest run src/tables/DataTable/DataTable.row-activation.test.tsx` reproduced three keyboard failures: Enter on the link and Enter/Space on the button invoked no callback with selected text in the row. The header selection guard now applies only to pointer clicks (`detail > 0`); all three keyboard paths activate exactly once while preserving the selection. Pointer selection remains inert.

A second red/green case establishes selection before detail toggling, including disabled rows. A third, in `DataTable.scroll-to-row.test.tsx`, reproduces a stale controlled reveal after an unknown-id call; every new request now invalidates the prior request before looking up its id. The scrollIntoView prototype descriptor is restored after each test. Body items are flattened once per render.

The metadata and prop documentation explicitly require a non-editable identifying column, explain that modifier clicks call onRowClick before opening a tab, record selection/detail precedence, and describe pending-request cancellation. The existing changeset still covers all changed published packages; registry output is regenerated. Browser suites remain assigned to PR CI.
