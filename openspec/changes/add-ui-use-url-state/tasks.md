# Tasks

## 1. Implementation

- [x] Add useUrlState, typed urlParam codecs, UrlStateProvider and adapter types to both UI entries.
- [x] Share immediate pending snapshots per adapter and batch delayed writes with history precedence.
- [x] Cancel on navigation, route changes and last unsubscription; retain failed writes in memory.
- [x] Add opt-in resource-index syncUrl for query, repeated filters and sort, preserving local defaults.

## 2. Tests

- [x] Public hook: typed parsing, invalid data, repeated keys, serialized defaults, prefix isolation, identity, no-op writes, batching, typing, push precedence, Back, popstate, route change, cleanup, SecurityError, provider/adapter precedence and hydration.
- [x] Public template UI: shared deep link, checked filter casing, descending rows, filter push and Back, clearAll and saved-view batching, invalid values, colon-bearing options, sort replacement and no history/listeners without syncUrl.
- [x] Catalog: live hook example, server output and accessibility through existing hook contracts; add a URL-synced resource-index preview.
- [x] Run required bounded toolchain checks and strict OpenSpec validation; record final evidence below.
- [ ] PR CI: browser accessibility and visual suites, full app builds, MCP CLI and eval tests (excluded on workers).

## 3. Docs and release

- [x] Explain codecs, SSR/hydration, memoized adapters, router recipes and limits in hook documentation.
- [x] Add English and Spanish hook example copy and document the template's saved-view limitation.
- [x] Add one changeset with minor bumps for @gntik-ai/ui and @gntik-ai/templates.
- [x] Regenerate registry output, format all changed files and commit locally.

## Test seams and red evidence

Tests use the public hook values/setter, adapter search, browser history boundary, server HTML/hydration, and resource-index's accessible DOM. Internal collaborators are not mocked. The hook test infers the issue's schema values without casts.

`pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx` failed first on the absent hook, then on missing codecs, setter and push behavior in successive vertical slices. Route-change and no-op assertions also failed before their implementations. The focused hook suite then passed. `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.example.test.tsx src/hooks/hooks-entry.test.ts` failed on the absent example and exports before they were added. `pnpm --filter @gntik-ai/templates exec vitest run src/resource-index/Page.test.tsx` ran after dependency builds and failed because the deep link's search box was empty before syncUrl was implemented; it passed after the binding was added.

The confirmed feature gap at base e5b91a3 is that resource-index owns local query/filter state and leaves sorting inside DataTable; there is no URL state hook. The change binds those already-controlled interfaces without changing DataTable or FilterBar APIs.

## Checker follow-up

The assigned branch was clean at f805096fc027c2ffe835cd7baa9f2d89ea453217 before this follow-up. The confirmed causes were unconditional cancellation on router commit notifications, rollback of router adapters' optimistic snapshots by older commits, cancellation without notifying other consumers during a route-change render, and clearing push mode before a history write succeeded. Undefined patch entries also reached codecs, and sort parsing rejected colon-bearing column IDs.

Red-before-green commands used the public hook, adapter boundary and accessible table UI:

- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx -t 'preserves newer input'`: expected de, received d when an earlier router write committed.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.routers.test.tsx`: executing both original documented recipes lost characters at 80/150 ms commits. Separating timer tasks also reproduced React Router adapter recreation when its navigate function changed identity. The updated recipes retain their optimistic snapshot and the React Router adapter now keeps a stable identity.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx -t 'restores both consumers'`: the second consumer stayed on pending after the first rendered the new route.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx -t 'retains a failed push'`: expected two push attempts, observed one; the retry incorrectly replaced history.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx -t 'ignores undefined'`: array serialization threw on undefined.
- `pnpm --filter @gntik-ai/templates exec vitest run src/resource-index/Page.test.tsx -t 'round-trips sorting'`: the header stayed aria-sort none after sorting resource:name.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx -t 'after a batch returns'`: a no-op batch forgot the last write, so its delayed acknowledgement dropped newer input. No-op batches now preserve acknowledgement tracking.

All these regressions pass after the fixes: 29 focused hook/router tests and 17 resource-index tests. The router tests execute the actual documentation recipes, mock only the router boundary, and verify two consumers and external navigation. The original spec requirement titles and the explicit Back/Forward requirement are restored. The existing single minor changeset remains sufficient for this ChangeSet; no dependency, lockfile or package version change is needed.

The initial follow-up retained explicit array history options. The later independent-checker follow-up below adds inheritance from the item codec, with an explicit array option taking precedence.

## Validation

The final library build, monorepo lint and typecheck, registry freshness, both kit-only checks, docs coverage, formatting and strict OpenSpec validation pass. Direct final checks pass 30 hook/router/example tests, six URL-specific server/axe tests, five built-entry tests, and all 17 resource-index tests. The built-entry import exceeded its normal 15-second allowance under parallel worker load; its isolated rerun passes with a 60-second test allowance.

The required recursive library test command stops at the unchanged tokens fixture described below. A second recursive sweep excluding tokens passed charts, CLI, codemods, editor, flow and icons, then produced no UI verdict for about nine minutes (about ten minutes overall). It was interrupted without an assertion verdict and is SKIPPED; PR CI must complete the broad UI, chat, blocks and templates suites. The affected hook, docs and resource-index checks above pass independently. Final verification is also recorded in the structured implementation result. The tokens mirror test remains unavailable without network: its fallback reads gntik-ai-tokens-0.2.1.tgz, but packing the current package produces a different-version tarball (ENOENT in test/mirror-install.test.mjs:93). This follow-up reproduced the unavailable fixture directly; no token files were changed. Browser suites are SKIPPED: browser suites run in PR CI. Full app builds, MCP CLI and eval tests also remain in PR CI under worker policy. No deployment, publication, visual baseline update or remote Git write was performed.

## Independent-checker follow-up at 74890f93

The assigned branch and clean worktree matched the supplied lease and previous HEAD. The regressions use the public hook and the actual documentation providers, with only the router boundary mocked. Consumers stay mounted across route changes. The router harness now models push/replace entries, Back and superseding an in-flight navigation.

- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx src/hooks/useUrlState.routers.test.tsx -t 'last acknowledged search'` failed three assertions before the fix: memory and both router adapters wrote pending input over navigation carrying the last acknowledged search. The store retained its acknowledgement marker indefinitely; it now consumes that marker when acknowledged, so later notifications cancel pending input.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.routers.test.tsx -t 'in-flight write was superseded'` failed for both recipes before the fix: Back returned q=d but both hooks retained page 2. Removing only the matching queue entry left superseded requests available to misclassify navigation. Both recipes now remove every request through the acknowledged entry.
- `pnpm --filter @gntik-ai/ui exec vitest run src/hooks/useUrlState.test.tsx -t 'inherits array item history'` failed before inheritance was added: pushState was called zero times instead of once. Arrays now use their own history option or the item codec's history.
- Added direct assertions for Forward in both consumers and the inclusive integer max boundary. The two focused hook/router files pass all 38 tests, including the existing newer-input and delayed-acknowledgement regressions.

The existing single minor changeset covers this follow-up; dependencies and package versions are unchanged. Final validation evidence follows after the bounded toolchain checks.

### Final follow-up validation

PASS: the required library build, monorepo lint and typecheck, registry generation and freshness, both kit-only checks, strict OpenSpec validation, docs coverage, formatting and diff whitespace checks. The affected public-seam checks pass all 184 hook/export/SSR/accessibility tests in seven files (including built entries) and all 17 resource-index tests. The built-entry suite uses a 60-second test allowance to accommodate worker load.

SKIPPED: the required recursive library test sweep stops in the unchanged tokens mirror fixture. A direct diagnostic run confirms ENOENT at test/mirror-install.test.mjs:93 for gntik-ai-tokens-0.2.1.tgz: the public registry is unavailable and the local fallback packs version 0.3.0. No test assertion in the changed code failed. PR CI must complete the broad library sweep, full app builds, MCP CLI and eval tests. Browser suites, including pnpm a11y, are SKIPPED because browser suites run in PR CI. No dependencies, lockfiles, protected configuration or visual baselines changed, and no remote Git write or deployment was performed.
