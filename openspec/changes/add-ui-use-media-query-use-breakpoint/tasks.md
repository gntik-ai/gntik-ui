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
