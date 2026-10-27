# Tasks

## 1. Implementation

- [x] 1.1 Add MermaidDiagram, token themes, the optional subpath and the pinned Mermaid peer.
- [x] 1.2 Export the opt-in code renderer map and add English/Spanish catalog and fallback strings.

## 2. Tests

- [x] 2.1 Cover lazy loading, streaming, fallback, hostile SVG, theme changes, toolbar actions, keyboard navigation and example axe checks.
- [x] 2.2 Reproduce and fix sequence stylesheet loss through the public component DOM; retain URL, import and escape rejection.
- [x] 2.3 Reproduce and fix docs subpath resolution and duplicate module identity; resolve examples to source in Vite and Vitest.

## 3. Docs and release

- [x] 3.1 Keep the live examples and the single chat minor/ui translation patch changeset.
- [x] 3.2 Regenerate registry output and run the bounded repository checks.
- [x] 3.3 Validate this OpenSpec change strictly and create an additional local commit.

## Checker follow-up evidence

The sequence stylesheet test uses the public MermaidDiagram DOM seam with Mermaid 12.2.0's `text.actor > tspan` and `.noteText > tspan` rules. `pnpm --filter @gntik-ai/chat exec vitest run --configLoader runner src/MermaidDiagram/MermaidDiagram.test.tsx -t 'sequence diagram'` failed because the stylesheet was removed. The confirmed cause was safeCss rejecting the child combinator. Allowing it preserves the theme colours while external URLs, imports and escapes remain rejected.

`node apps/docs/test/mermaid-source.test.mjs` failed because Vite resolved the examples' public subpath to packages/chat/dist/mermaid.js rather than packages/chat/src/mermaid.ts. The public-entry identity regression also failed before the Vitest alias was added. The exact subpath now resolves to source in both configurations, sharing one component and loader graph without relying on a library build. `node --test apps/docs/test/mermaid-source.test.mjs` and all 22 component tests pass after the fix.

## Final validation

Library builds, lint, monorepo typecheck, registry freshness, both consumer kit-only checks, docs coverage, docs source resolution, changed-file formatting and strict OpenSpec validation pass. All ten library package suites excluding tokens, MCP and evals pass, including the complete chat suite and its example axe checks. The other twelve token test files also pass.

The required aggregate library test command is SKIPPED for the offline environment: the unchanged tokens mirror-install test cannot fetch the published artifact, packs the current 0.3.0 package instead, and raises ENOENT while opening gntik-ai-tokens-0.2.1.tgz before the install assertions. This was confirmed by directly running that test. Browser a11y/visual suites, Next.js builds and MCP/evals tests remain PR CI checks under worker policy. Real Mermaid hostile-source rendering is skipped in jsdom because SVG geometry APIs are absent. Current advisory status for the pinned Mermaid 12.2.0 peer cannot be verified without network access.
