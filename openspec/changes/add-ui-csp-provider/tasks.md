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
- [x] Run bounded repository checks and strict OpenSpec validation. See the follow-up validation record below for current evidence.
- [ ] Operator: run `pnpm --filter @gntik-ai/example-next test:csp` against the production build; the existing PR CI does not schedule this standalone suite.
- [ ] Verify docs axe suites in PR CI (browser suites excluded on workers).

## 3. Docs and release

- [x] Add catalog API documentation, live previews and a Strict CSP guide.
- [x] Add exactly one minor changeset for @gntik-ai/ui.
- [x] Format changed files, regenerate registry output and create one local commit.

## Test seams and red evidence

The seams are the public kit entry's rendered DOM and renderToString output, the Next.js proxy's request/response interface, and catalog examples. The dependency-source inventory is an explicit upgrade alarm required by the issue. No internal modules are mocked.

`pnpm --filter @gntik-ai/ui test src/csp/CSPProvider.test.tsx` failed first on missing public exports, then on absent static scrollbar classes; it passed after each implementation slice. `pnpm --filter @gntik-ai/ui test src/layouts/PrintLayout/PrintLayout.csp.test.tsx` failed because PrintLayout did not read CSP context (no nonce and no style suppression), then passed after the fix. `cd apps/example-next && node --test test/csp.test.mjs` failed before proxy.ts existed, then passed. The live example test was also run before its missing preview was added.

## Renderer compatibility

React 19.3 hoists resource styles and only preserves their nonce when the server renderer receives `nonce: { script: nonce, style: nonce }`. The installed Next.js renderer passes a string nonce (scripts only). The reference app therefore also enables `disableStyleElements` and serves its default print rule as a named page for the CSP route from globals.css. This avoids a blocked resource style during the initial response while preserving nonced theme and prehydration scripts. Both supported streaming setups have public-seam tests; the guide documents this constraint. ScrollArea and Select nonce tests use independent DOM documents so React's resource cache cannot mask either component's behavior.

## Validation

The library build, lint, monorepo typecheck, registry freshness, both consumer kit-only checks, docs build, docs coverage, strict OpenSpec validation and formatting checks pass. The proxy nonce test and the public MCP usage/discoverability tests pass. The repaired CSP example test passes in 12 consecutive runs, and all ten permitted library suites excluding the unavailable tokens mirror test pass (including the full UI, blocks, chat and templates suites).

The prescribed recursive library unit command stops at the unchanged tokens mirror-install test without network. Its offline fallback packs the current 0.3.0 package but then reads gntik-ai-tokens-0.2.1.tgz, producing ENOENT. This is an environment-limited check, not a new assertion failure. The six tokens suites excluding mirror installation pass. The remaining library run passes: `pnpm -r --filter './packages/**' --filter '!@gntik-ai/tokens' --filter '!@gntik-ai/gntik-ui-mcp' --filter '!@gntik-ai/evals' test`.

Browser suites were not launched under worker policy. Docs axe runs in PR CI; production Next.js CSP needs an explicit operator run because the existing workflow selects only docs a11y tests. Run `pnpm --filter @gntik-ai/example-next test:csp` to collect AC6 production browser evidence: its config builds and starts Next rather than using dev mode. A discovered browser test is not an executed pass. MCP CLI and evals suites remain reserved for PR CI.

## Checker follow-up

The example test queried the Select listbox before Base UI asynchronously mounted it. Repeating `pnpm --filter @gntik-ai/ui test src/csp/CSPProvider.example.test.tsx` reproduced the reported missing-listbox assertion before the fix. The assertion now awaits `findByRole`.

A public `usageOf` regression test failed with `PrintLayoutCSP.tsx` instead of `PrintLayoutInvoice.tsx`; renaming the secondary demo to `PrintLayoutStaticStyles.tsx` restores the invoice in MCP and llms-full.txt. A second registry-lookup test failed before adding the provider as an installable `csp-provider` item; its description also makes `useCSP` searchable. These tests run directly without the MCP CLI suite's subprocess-dependent tests.

The provider metadata no longer lists tokens because it renders no DOM. Spanish translates the guide title. Guide prose lives in the docs app's en/es catalog, while shared live-preview labels stay in the runtime catalog. Catalog display metadata is derived without mutating the inventory. The fallback print rule uses a named page selected only by the CSP route. The script-only renderer workaround remains necessary and covered by the streaming tests.

Production browser evidence is still pending: workers must not launch Chromium, and `.github` cannot be edited in this ChangeSet. The production Playwright config and standalone command remain available for the operator. A discovered test is not an executed browser pass.

Renaming the PrintLayout demo also changes its preview URL. A browser-free public loader test reproduced the stale axe target (`print-layout--print-layout-csp`) before changing the browser fixture to `print-layout--print-layout-static-styles`; the configured CSP axe previews now both resolve and load successfully.
