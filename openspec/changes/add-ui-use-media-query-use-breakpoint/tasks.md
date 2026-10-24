# Tasks

## 1. Implementation

- [x] Add public useMediaQuery, usePrefersReducedMotion, useBreakpoint and useBreakpointValue hooks and types, without a hooks subpath export.
- [x] Add runtime breakpoint tokens, explicit matching CSS defaults and parity tests.
- [x] Adopt hooks in InspectorLayout, Carousel, Tour, DocsLayout Outline, FlowBuilder and useChatScroll, preserving explicit true fallbacks.

## 2. Tests

- [x] Test rendered hook consumers: matching, updates, missing API, legacy API, shared listener cleanup, SSR, hydration and mobile-first resolution.
- [x] Test Carousel reduced-motion scrolling and hydration, preserving existing suites unchanged.
- [x] Run required library checks, docs coverage, docs media-query comparison and strict OpenSpec validation.
- [ ] Confirm browser accessibility suites in PR CI (worker policy excludes browser suites).

## 3. Docs and release

- [x] Add catalog doc files and live examples for all four hooks and runtime breakpoint exports.
- [x] Add one changeset with minor UI/tokens and patch blocks/chat bumps.
- [x] Regenerate registry and llms output (llms content is unchanged).
- [x] Create one local commit.

## Validation notes

The public test seams are rendered React hook consumers, server markup and hydration, browser MediaQueryList subscriptions, runtime token exports and generated CSS. The new hook and token tests were run red for the missing APIs before implementation. The Carousel hydration regression also failed before adoption: reading the browser preference during initial state creation produced different play/pause markup from the server. Reproduction: `pnpm --filter @gntik-ai/ui test src/components/Carousel/Carousel.motion.test.tsx`. It now passes with a stable hydration fallback and preference-driven autoplay until the reader uses the play control. Existing affected test files are unchanged.

Library build, lint, typecheck, registry:check, both consumer kit-only checks, docs coverage, strict OpenSpec validation and the docs build pass. The before/after docs builds have identical CSS asset hashes and all 13 media queries match. The six token test files unrelated to mirror installation pass, including the frozen-values checks.

The prescribed recursive library test command cannot complete the token mirror-install test without network access. Its existing fallback packs the unchanged local 0.3.0 package but then reads gntik-ai-tokens-0.2.1.tgz, causing ENOENT. No assertion about the changed code failed; the network-enabled mirror check remains for PR CI. MCP/evals tests and browser suites also remain in PR CI under the worker policy; no browser suite was launched. All remaining library suites pass when run separately with tokens, MCP and evals excluded, including UI, blocks, chat and templates.

## CI repair: wrapped-log follow

The supplied a11y shard 3/3 log reports that Follow remains checked after an upward scroll. A new public LogViewer regression reproduces that exact assertion locally: `pnpm --filter @gntik-ai/blocks test src/builders/LogViewer/LogViewer.follow.test.tsx` failed before the repair. It changes DOM scrollTop before delivering the browser scroll event, then commits a wrapped-row measurement. The measurement changes maxScroll, and the follow effect overwrites the upward position before the event can disable Follow. This ordering also explains why the browser failure can depend on timing after a viewport resize; the existing LogViewer code was unchanged by the initial feature commit.

The repair remembers the last follow position and checks the current DOM position before repinning. An upward scroll disables Follow and preserves the user's position, including when its event has not arrived yet. Comparing against the smaller of the old position and the new maximum permits normal browser clamping as content shrinks. The new regression and unchanged wrapping suite pass after the repair. Existing unit and browser tests remain unchanged. The existing wrapping example already demonstrates follow, viewport reflow and scrolling up; the single changeset now mentions this fix. The browser shard must still run in PR CI under the worker policy.

Repair validation: library build, lint, typecheck, registry freshness, both kit-only checks, docs coverage, strict OpenSpec validation and formatting pass. All permitted library suites excluding tokens pass; the six token suites excluding mirror installation pass unchanged. The prescribed recursive unit command cannot complete without network: the token mirror test's offline fallback still reads the absent 0.2.1 tarball after packing 0.3.0 (ENOENT). Browser suites, app builds and MCP/evals tests remain for PR CI as required by the worker policy.
