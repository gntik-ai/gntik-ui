# Tasks

## 1. Implementation

- [x] 1.1 Add useLocalStorage, useSessionStorage, readLocalStorageValue and typed options; export from the public UI entry.
- [x] 1.2 Adopt shared storage in SidebarLayout and Resizable, preserving props, keys, formats, validation and deferred drag writes.

## 2. Tests

- [x] 2.1 Cover defaults, writes, updater batching, remove, same-document and cross-tab sync, clear, sync:false, session isolation, access/write failures, invalid data, identity and key changes.
- [x] 2.2 Verify renderToString does not access storage and hydrateRoot restores data without mismatch; include the SidebarLayout regression.
- [x] 2.3 Verify Resizable restores current arrays, rejects invalid/count-mismatched data, rounds writes and keeps existing pointer tests unchanged.
- [x] 2.4 Exercise the live storage example with keyboard-accessible controls and axe.
- [x] 2.5 Run bounded repository checks, docs coverage and strict OpenSpec validation.
- [ ] 2.6 Verify browser accessibility suites in PR CI (worker policy excludes browser suites).

## 3. Docs and release

- [x] 3.1 Add TSDoc, catalog metadata and a live example for local storage, shared consumers, one-shot reads and session storage.
- [x] 3.2 Add exactly one minor changeset for @gntik-ai/ui.
- [x] 3.3 Format changes, regenerate registry output and commit locally.

## Test seams and red evidence

The seams are the exported UI hooks' returned values, browser storage and events, renderToString/hydrateRoot output, SidebarLayout's rendered rail, Resizable's rendered sizes and the live catalog preview. Storage APIs are the only mocked system boundary.

Before source changes, `pnpm --filter @gntik-ai/ui test src/layouts/SidebarLayout/SidebarLayout.storage.test.tsx` reproduced the hydration mismatch on 68b72bc: client rail attributes disagreed with expanded server markup. The cause was reading storage in the useState initializer. The same test passes with the hook's default server snapshot. `pnpm --filter @gntik-ai/ui test src/components/Resizable/Resizable.storage.test.tsx` also failed first on server storage access before hook adoption. Hook behavior was implemented in successive failing-test slices, including the previously missing public exports and live example.

## Validation

All 44 focused tests pass, including the public hook API, the live example's axe check, both hydration regressions and the unchanged SidebarLayout/Resizable suites. Library builds, lint, monorepo typecheck, docs build, docs coverage, registry freshness, both consumer kit-only checks, formatting and strict OpenSpec validation pass.

The prescribed recursive library test command stops at the unchanged tokens mirror-install test. Without registry access, its fallback packs the current 0.3.0 package but tries to read gntik-ai-tokens-0.2.1.tgz, producing ENOENT. This is recorded as environment-limited; the remaining token checks pass with that test excluded. The broader library run excludes tokens to let the other package suites execute; its final result is reported in the structured handoff.

Browser accessibility/visual suites, MCP CLI tests and evals tests remain for PR CI under worker policy. No browser suite was launched. Registry generation leaves registry.json and llms output unchanged and updates kit-registry.json plus the affected shadcn item bundles.

## Final review follow-up

A later-mounted sync:false consumer could inherit the document's pre-event value. The added public-hook regression failed with comfortable instead of spacious before the fix. Per-consumer snapshots now start from the latest raw value and follow only later same-document writes, using a document write version; previously mounted isolated consumers remain unchanged by external events. The final 44-test focused run passes. The full UI suite passed before this follow-up; final focused tests exercise the changed synchronization behavior and both adopting layouts.
