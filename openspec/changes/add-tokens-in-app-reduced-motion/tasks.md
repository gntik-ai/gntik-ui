# Tasks

## 1. Implementation

- [x] Add duration scope and zero-specificity motion variants without changing frozen values.
- [x] Add SSR-safe runtime motion readers and observers.
- [x] Add ThemeProvider motion state, storage and themeScript restoration.
- [x] Share one UI motion hook under both public names and adopt it in scrolling and autoplay.
- [x] Connect live charts to the tokens runtime.
- [x] Add localized Reduce motion settings and token-based Dialog durations.

## 2. Tests

- [x] Run failing token scope/variant, runtime, hook, Carousel, provider, script, live chart and settings switch tests before their implementation.
- [x] Cover runtime attribute and OS changes, unsubscribe, SSR and hydration.
- [x] Cover Tour, Outline and chat non-smooth scrolling and three-theme jsdom axe audits.
- [x] Add focused browser coverage for scoped Skeleton, StatusDot, motion-safe and Dialog computed styles.
- [ ] Run browser checks and catalog visual comparisons in PR CI (worker policy excludes browser suites).

## 3. Docs and release

- [x] Document optional motion props, hook aliases, runtime helpers and script options, with a live preview.
- [x] Add one minor tokens/UI/templates and patch chat/charts changeset.
- [x] Regenerate registry and llms artifacts.
- [x] Validate this OpenSpec change with strict validation.

## Validation notes

Public seams: published CSS declarations, tokens runtime functions with DOM and browser media-query boundaries, rendered React hooks and components, SSR markup/hydration, settings Switch interactions and axe audits. Token declarations, runtime functions, hook aliases, Carousel state, provider persistence, script restoration, live series and the settings switch failed before their respective feature implementations. Representative red command: `pnpm --filter @gntik-ai/ui test src/hooks/useMediaQuery.test.tsx src/components/Carousel/Carousel.motion.test.tsx` (missing useReducedMotion and incorrect autoplay state). Token motion tests ran directly with `node packages/tokens/test/motion.test.mjs` to expose the missing CSS assertions.

The prescribed recursive library test command stops at the unchanged token mirror-install test: in this network-free environment its fallback packs version 0.3.0 but attempts to open the absent gntik-ai-tokens-0.2.1.tgz (ENOENT). Remaining library suites and the six token suites without mirror installation are checked separately. Browser accessibility/visual suites, MCP CLI tests, evals and Next.js builds remain in PR CI under worker policy. No browser suite was launched.

The existing published-bootstrap test caught a 637-character script exceeding its unchanged 600-character safety gate. Reproduction: `pnpm --filter @gntik-ai/ui test src/test/theme-bootstrap.test.ts`. Compacting the additive motion restoration preserves the existing theme script and produces 574 characters; the bootstrap and motion script tests pass together (14 tests). The size and security assertions remain unchanged.
