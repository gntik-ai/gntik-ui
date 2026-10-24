# Tasks

## 1. Implementation

- [x] Add the public typed CSPProvider wrapper, kit context and useCSP hook.
- [x] Honor nonce and disableStyleElements in PrintLayout.
- [x] Add static scrollbar classes only to ScrollArea and Select slots.
- [x] Add strict CSP documentation and the production Next.js proxy and provider wiring.

## 2. Tests

- [x] Run public provider tests red before implementation, then green for nonce styles, server scripts and defaults.
- [x] Run static scrollbar and PrintLayout acceptance tests red before their source changes, then green.
- [x] Run the request interceptor test red before proxy.ts, then green for policy forwarding and fresh nonces.
- [x] Add the installed Base UI inline-element inventory and translated accessible live examples.
- [x] Run bounded repository checks and strict OpenSpec validation (offline mirror check deferred below).
- [ ] Verify production Next.js Playwright and docs axe suites in PR CI (browser suites excluded on workers).

## 3. Docs and release

- [x] Add catalog API documentation, live previews and a Strict CSP guide.
- [x] Add exactly one minor changeset for @gntik-ai/ui.
- [x] Format changed files, regenerate registry output and create one local commit.

## Test seams and red evidence

The seams are the public kit entry's rendered DOM and renderToString output, the Next.js proxy's request/response interface, and catalog examples. The dependency-source inventory is an explicit upgrade alarm required by the issue. No internal modules are mocked.

`pnpm --filter @gntik-ai/ui test src/csp/CSPProvider.test.tsx` failed first on missing public exports, then on absent static scrollbar classes; it passed after each implementation slice. `pnpm --filter @gntik-ai/ui test src/layouts/PrintLayout/PrintLayout.csp.test.tsx` failed because PrintLayout did not read CSP context (no nonce and no style suppression), then passed after the fix. `cd apps/example-next && node --test test/csp.test.mjs` failed before proxy.ts existed, then passed. The live example test was also run before its missing preview was added.

## Renderer compatibility

React 19.3 hoists resource styles and only preserves their nonce when the server renderer receives `nonce: { script: nonce, style: nonce }`. The installed Next.js renderer passes a string nonce (scripts only). The reference app therefore also enables `disableStyleElements` and serves its default `@page` rule from globals.css. This avoids a blocked resource style during the initial response while preserving nonced theme and prehydration scripts. Both supported streaming setups have public-seam tests; the guide documents this constraint. ScrollArea and Select nonce tests use independent DOM documents so React's resource cache cannot mask either component's behavior.

## Validation

The library build, lint, monorepo typecheck, registry freshness, both consumer kit-only checks, docs build, docs coverage, strict OpenSpec validation and formatting checks pass. The public HTTP-boundary nonce test passes. All 20 focused CSP tests pass. The expanded run passes 89 tests across CSP, ScrollArea, Select, Combobox, Tabs, Slider and PrintLayout, including unchanged existing regression suites; the additional fresh-document default-style test passes separately. All permitted library suites excluding the unavailable token mirror test pass, including UI, blocks, chat and templates.

The prescribed recursive library unit command cannot complete the unchanged tokens mirror-install test without network. The registry fetch fails and its offline fallback then reads gntik-ai-tokens-0.2.1.tgz after packing the current 0.3.0 package, producing ENOENT. The six token suites excluding mirror installation pass. The remaining permitted library suites pass when run separately with tokens, MCP and evals excluded.

Browser suites (production Next.js CSP and docs axe in all three themes) are reserved for PR CI under worker policy and were not launched. Playwright discovers both production tests through `pnpm --filter @gntik-ai/example-next test:csp --list`. Run `pnpm --filter @gntik-ai/example-next test:csp` and `pnpm a11y` in PR CI; the production config builds and starts Next rather than using dev mode. MCP CLI and evals suites likewise remain for PR CI.
