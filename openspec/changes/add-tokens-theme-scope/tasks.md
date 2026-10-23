# Tasks

## 1. Tokens

- [x] 1.1 Add packages/tokens/scripts/build-scope.mjs and the generated src/scope.css; import it in src/tailwind.css after pairing.css and export `./scope.css`.
- [x] 1.2 Add packages/tokens/test/scope.test.mjs: `.light` equals the frozen `:root` values and the pairing aliases, and each selector declares its color-scheme.

## 2. Components

- [x] 2.1 Add packages/ui/src/theme/ThemeScope.tsx with ThemeScope.doc.ts and examples, export it from packages/ui/src/index.ts, and add packages/ui/src/utils/portal.ts.
- [x] 2.2 Read `usePortalContainer()` in the 19 components that render a Base UI `*.Portal`.
- [x] 2.3 Add `forcedMode` to packages/ui/src/theme/ThemeProvider.tsx and render the theme-builder previews in ThemeScope (apps/docs/src/catalog/theme-builder.jsx).

## 3. Tests

- [x] 3.1 ThemeScope.test.tsx: class and data attribute, nested scopes, useTheme, portal container lifecycle, a Select inside the scope, axe.
- [x] 3.2 A test that fails when a `*.Portal` in packages/ui ignores the scope container.
- [x] 3.3 ThemeProvider.test.tsx: forcedMode with a stored mode and with setMode.
- [x] 3.4 Verify generator output without writing into the source checkout: import the renderer from a temporary directory without src and compare repeated rendering against the committed CSS.
- [x] 3.5 Run library build, lint, typecheck, scoped library tests, registry:check, docs coverage and both consumer kit-only checks.
- [ ] 3.6 Build docs and run browser computed-style and axe checks on the new examples in dark, light and high_contrast.

## 4. Docs and release

- [x] 4.1 Add one changeset: minor for `@gntik-ai/tokens`, `@gntik-ai/ui`, including the `.light` class collision risk.
- [x] 4.2 Run `pnpm registry` and commit the generated files.
- [x] 4.3 Run `openspec validate add-tokens-theme-scope --strict`.

## Review follow-up

The original feature commit omitted this OpenSpec folder, making strict validation report an unknown item. These deltas preserve the issue-pack requirements. The generator test originally imported a script that wrote src/scope.css; the regression first failed with ENOENT when that script was imported from an isolated directory without src. A pure renderer and CLI-only writes now keep the test from modifying the checkout. The public seam is generated CSS output and import behavior; expected values continue to come from frozen-values.json, pairing.css and the committed generated stylesheet. Portal imports follow external imports, and the forced-mode example imports ReactNode explicitly.

Library build, lint, typecheck, registry:check, docs build, docs coverage and both consumer kit-only checks pass. All five token test files that do not require sockets pass. The recursive library tests with tokens, MCP and evals excluded also pass, including UI, blocks, chat and templates. Running the generator twice produces no diff; brand.css, pairing.css and frozen-values.json remain unchanged from the assigned base. Registry regeneration updates only the 19 serialized overlay sources after import ordering changes; the root registry and llms output remain current. The existing single minor changeset for tokens and UI is preserved.

The required recursive library test command stops at the token mirror-install test because its HTTP server cannot bind (`listen EPERM: operation not permitted 127.0.0.1`). Playwright a11y cannot start its preview server; a direct loopback preview confirms `listen EPERM: operation not permitted 127.0.0.1:4173`. These are sandbox skips, and PR CI must confirm mirror installation, browser computed styles and axe including contrast in all three themes. The docs build succeeds, but task 3.6 remains open until those browser checks run.
