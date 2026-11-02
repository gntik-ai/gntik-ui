# Tasks

## 1. Implementation

- [x] 1.1 Add packages/ui/src/kit/KitProvider.tsx, useApp, index.ts and KitProvider.doc.ts, and export them from packages/ui/src/index.ts.
- [x] 1.2 Add the portal-container context and read it in every overlay Portal, including the full-screen Dropzone React portal with a document.body fallback.
- [x] 1.3 Implement scoped mode with ThemeProvider target, wrapper lang/dir/density and a portal host, with no CSS isolation.
- [x] 1.4 Emit KitProvider from CLI init, update MCP setup texts, and adopt it in the example and product apps.

## 2. Tests

- [x] 2.1 Add KitProvider.test.tsx: defaults, pass-through props, false switches, nesting, useApp toast, confirm and announce, and the error outside a provider.
- [x] 2.2 Add container cases for every listed overlay, explicit precedence, the body fallback, a scoped-mode test asserting html stays untouched, and hydration tests.
- [x] 2.3 Update the CLI init snapshot tests for Vite and Next.js and MCP setup tests.
- [ ] 2.4 Browser axe in dark, light and high_contrast runs in PR CI; local example axe tests cover all three themes.

## 3. Docs and release

- [x] 3.1 Keep the minor changeset for @gntik-ai/ui and the CLI and separate private MCP changesets.
- [x] 3.2 Include the prop-to-provider table, own-toast guidance and scoped CSS limitation in the docs; regenerate registry outputs and verify docs coverage.
- [x] 3.3 Run openspec validate add-ui-kit-provider --strict.
