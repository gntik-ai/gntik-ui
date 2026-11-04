# Tasks

## Implementation

- [x] Add useTableData, TSDoc and public exports with committed-state requests, abort/stale guards, cache, retained data, retries, foreground polling and cursor accumulation.
- [x] Rewrite the numbered-page example and add the cursor example with a separate LoadMoreFooter.
- [x] Document defaults, endpoint wrapping, serialisable filters, per-instance cache growth and npm-only availability; register both live previews.

## Tests

- [x] Test public hook state with deferred requests and fake timers: stale success/rejection, cache/expiry, failed retries, filters and callback identities, cursors, polling, SSR, enabled, unmount and StrictMode.
- [x] Exercise rendered DataTable resize, sorting, saved-view sort clearing and aria-sort rollback.
- [x] Preserve existing selection and server-pagination assertions, adapting mount-request mechanics.
- [x] Test cursor append, retry and exhaustion with axe in all three themes.

## Release and validation

- [x] Add exactly one minor changeset for @gntik-ai/blocks.
- [x] Regenerate registry and catalog artifacts and run registry:check.
- [x] Run library builds, lint, typecheck, docs coverage and kit-only checks.
- [ ] Complete the cross-library test command in PR CI with the missing token mirror fixture available.
- [x] Run openspec validate add-blocks-use-table-data --strict (or record tool/environment limits).
- [x] Leave browser accessibility/visual suites to PR CI under worker policy.

## Prior attempt validation (b834b670)

Worker validation notes: browser accessibility/visual suites run in PR CI. The token mirror-install fixture cannot complete offline: its local fallback expects the missing gntik-ai-tokens-0.2.1.tgz while the package is 0.3.0. Run it with the pinned published artifact in CI; remaining library tests are run separately.

Implementation handoff: the assigned branch and immutable base 9e6612b620c2a92ac54a5090b5db1db4b81d281e were verified. Existing uncommitted work was confined to this ChangeSet and preserved. Public seams reviewed: hook state/handlers, rendered DataTable query controls, and the cursor example with LoadMoreFooter. The focused run passed 75 tests. Library builds, lint, typecheck, registry regeneration/check, strict OpenSpec validation, docs coverage and both consumer kit-only checks passed. No dependency or runtime component changes were needed. The full library command stops at the unrelated offline token mirror fixture; its missing 0.2.1 tarball is an environment limitation. All other token test files pass. Browser suites remain for PR CI.

Final package validation: `pnpm --filter @gntik-ai/blocks test` passed all 160 files and 1,191 tests. The supplemental cross-library retry excluding tokens completed the UI suite, then was stopped at the worker verification limit to avoid repeating the independently passed blocks suite. The interrupted command is SKIPPED, not an assertion failure; unfinished cross-library validation remains for PR CI.

## Checker follow-up

- [x] Reproduce active-request reload deduplication, nullish failures, and cursor/query mismatches at the public hook seam, red before green.
- [x] Make invalidate/refetch replace active work and ignore its late result and cache write; preserve deduplication for ordinary query callbacks.
- [x] Normalise nullish failure reasons into an Error and expose a non-empty footer message.
- [x] Refuse cursor appends until a failed query is retried, and poll only confirmed segments so a failed append cannot silently add rows.
- [x] Restore confirmed rows and sort when disabled and consume a forced reload once so later re-enabling can use fresh cache.

Reproduction command: `pnpm --filter @gntik-ai/blocks test src/hooks/useTableData.test.tsx`. Each new regression was run before its source fix and failed on the reported symptom. Confirmed causes: same-key deduplication ignored explicit reload intent; nullish rejection reasons doubled as the no-error sentinel; cursor appends and polls reused pending params with a confirmed cursor; disabling retained the pending presentation; the force flag survived its reload. The existing minor changeset and live examples remain the release/documentation coverage for this ChangeSet.

Follow-up validation: library builds, lint, monorepo typecheck, registry:check, both consumer kit-only checks, docs coverage and strict OpenSpec validation pass. The focused hooks/DataTable/LoadMoreFooter command passes 19 files and 291 tests, including cursor example axe checks in dark, light and high_contrast. An initial focused run overlapped a dependency build and could not resolve UI output; rerunning after builds completed passed. The required cross-library command is SKIPPED: tokens/test/mirror-install.test.mjs cannot fetch the pinned artifact offline and its fallback raises ENOENT for gntik-ai-tokens-0.2.1.tgz (the local package is 0.3.0). Confirmed by running the fixture directly. No assertion failure remains in the changed code. Browser suites, mcp CLI tests and evals tests remain for PR CI under worker policy. No dependencies, protected paths or visual baselines changed.

## Independent checker repair on top of 4fc094ed

- [x] Verify a clean assigned branch at 4fc094eda48bf323e3671406d6176ce4c5bac1c4, with immutable base 9e6612b620c2a92ac54a5090b5db1db4b81d281e.
- [x] Reproduce each blocker at its public seam before its source fix: rendered DataTable resize, hook append announcements and cursor load-more handlers.
- [x] Honour DataTable's computed page on resize (page 5 at size 20 becomes page 2 at size 50 in one request).
- [x] Keep lastAppend unchanged when re-enabling an already displayed segment, both with fresh cache and cacheTime=0; verify that the next new segment increments once.
- [x] Let direct and footer loadMore retry an upstream-aborted append without losing earlier segments or surfacing an error.
- [x] Keep background polling out of the footer's Loading more state, while still preventing concurrent loadMore requests.
- [x] Demonstrate error recovery after exhaustion in the cursor preview, with one error panel and a retry for the failed query.
- [x] Correct the resize documentation, document tableProps.filters, restore a table-focused catalog summary and regenerate registry output.

Reproduction commands (each run red before its corresponding source fix):

- `pnpm --filter @gntik-ai/blocks test src/hooks/useTableData.integration.test.tsx`: page-five resize received page 1 instead of page 2.
- `pnpm --filter @gntik-ai/blocks test src/hooks/useTableData.test.tsx`: re-enable returned lastAppend.seq=2 instead of 1 with both cache settings; direct/footer loadMore made no retry after an upstream AbortError; background polling incorrectly set footer loading=true.
- `pnpm --filter @gntik-ai/blocks test src/tables/DataTable/DataTable.cursor-example.test.tsx`: a failed refresh after exhaustion offered no Try again button. The initial test query was narrowed to the visible error heading to avoid matching its live announcement.

Confirmed causes: the query adapter reset pageSize changes to page 1; cursor presence was mistaken for a newly appended segment; the pending/confirmed-key guard stranded silently aborted appends; the footer reused all fetching as append loading; and the preview displayed its standalone retry only before the first result. These fixes preserve the existing minor changeset and do not change shared DataTable or LoadMoreFooter runtime code. Naming-only suggestions were reviewed without unrelated refactoring.

Current worker environment: the required cross-library command stops in the unchanged token mirror fixture. Running `node --test test/mirror-install.test.mjs` in packages/tokens reproduces the stop; direct execution exposes ENOENT for gntik-ai-tokens-0.2.1.tgz after the offline fallback packs the local 0.3.0 package. The earlier checker's successful token run does not reproduce in this sandbox. This check is SKIPPED for the missing artifact, and the remaining libraries are tested separately. Browser suites, mcp CLI tests and evals tests remain in PR CI under worker policy.

Repair validation: library builds, lint, monorepo typecheck, registry generation/check, both kit-only checks, strict OpenSpec validation, docs coverage, preview-catalog, catalog-pages and formatting checks pass. The supplemental library command excluding tokens passed every remaining library: charts, cli, codemods, editor, flow, icons, ui, blocks, chat and templates. The full blocks suite includes the new regression tests and existing cursor axe coverage in all three themes. Vitest rewrote an unrelated auth snapshot's formatting; its values were verified identical and the original formatting restored. No dependencies, shared runtime components, protected paths or visual baselines changed.
