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

## Validation

The final library build, monorepo lint and typecheck, registry freshness, both consumer kit-only checks, docs coverage, catalog loading and strict OpenSpec validation pass. All 119 changed files were formatted with Prettier. The focused hook/entry/server/accessibility run passes 161 tests, built-entry contracts pass five tests, and resource-index passes all 16 tests. A built-entry import initially exceeded the existing 15-second test timeout under concurrent load; its isolated rerun with a 60-second test timeout passes, and the subsequent full UI suite also passes at the repository's configured timeout.

The required recursive unit command stops at the unchanged tokens mirror-install check without network. Its offline fallback packs the current tokens package but then attempts to read gntik-ai-tokens-0.2.1.tgz, producing ENOENT. Direct reproduction confirms an unavailable artifact, rather than an assertion failure in this change. This check is SKIPPED for the worker environment. The other 17 tokens files pass. All ten remaining library packages pass with `pnpm -r --filter './packages/**' --filter '!@gntik-ai/tokens' --filter '!@gntik-ai/gntik-ui-mcp' --filter '!@gntik-ai/evals' test`.

Full monorepo build/test commands were not launched under worker policy. App builds, MCP CLI and eval suites, and browser accessibility/visual suites remain for PR CI. Browser checks are SKIPPED: browser suites run in PR CI. The tokens mirror check also needs registry access in CI. No dependencies or lockfiles changed, no visual baselines were recorded, and no packages were published.
