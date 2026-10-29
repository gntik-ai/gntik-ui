# Tasks

## 1. Implementation

- [x] 1.1 Add match and pattern to NavItem plus matchesNavPath, matchesNavPattern and resolveCurrentNavItem; export from the public UI entry.
- [x] 1.2 Add NavListProps.match and memoize the resolved winner on groups, currentHref and match.
- [x] 1.3 Use resolved current state in NavLeaf, NavParent expansion and NavRailFlyout.
- [x] 1.4 Memoize the same winner resolution for StackedLayout top links.
- [x] 1.5 Add NavListRouteMatching and matching documentation, with en/es preview copy.

## 2. Tests

- [x] 2.1 Cover exported helpers: boundaries, root, query/hash/trailing slash, dynamic segments, wildcard, arrays, specificity, exact-first, ties and explicit flags.
- [x] 2.2 Cover rendered NavList: one current item, inherited/overridden matching, explicit flags, sections and rail flyout children.
- [x] 2.3 Cover StackedLayout's single current top link on a nested route.
- [x] 2.4 Cover the live example's keyboard interaction, Spanish copy and jsdom axe in all three themes (colour contrast requires the browser).
- [x] 2.5 Run bounded repository checks and strict OpenSpec validation.
- [ ] 2.6 Run browser accessibility and visual suites in PR CI; worker policy excludes these suites.

## 3. Docs and release

- [x] 3.1 Add exactly one minor changeset for @gntik-ai/ui.
- [x] 3.2 Format changes and regenerate registry and LLM output.
- [x] 3.3 Commit locally on the assigned branch.

## Test seams and red evidence

Tests exercise the exported matching helpers, rendered navigation landmarks/links/menu items, and the localized live example's controls. No internal collaborators are mocked. Each feature slice was tested red before its implementation. Commands: `pnpm --filter @gntik-ai/ui test src/components/NavList/nav-context.test.ts`, `pnpm --filter @gntik-ai/ui test src/components/NavList/NavList.test.tsx`, `pnpm --filter @gntik-ai/ui test src/layouts/StackedLayout/StackedLayout.test.tsx` and `pnpm --filter @gntik-ai/ui test src/components/NavList/NavListRouteMatching.test.tsx`.

Helper tests first failed on missing public exports. Rendered tests then exposed per-item matching marking two overlapping prefixes, missing inherited prefix matches, and flyout/section state ignoring the single winner. The fix resolves the winner once and uses it consistently across those rendered surfaces. Exact href ties retain the first document-order match even if another exact item also has a longer pattern.

## Final validation and limits

The final focused command passes all 68 tests, including the original NavList and StackedLayout tests. The complete UI suite and every other library suite pass in the recursive run excluding tokens, MCP and evals. Library builds, monorepo lint and typecheck, repository formatting, docs coverage, strict OpenSpec validation, registry freshness and both consumer kit-only checks pass.

The prescribed recursive library command stops in the unchanged token mirror-install test. With no network, its fallback packs version 0.3.0 but reads gntik-ai-tokens-0.2.1.tgz, producing ENOENT at packages/tokens/test/mirror-install.test.mjs:93. Its isolated rerun confirms the same environment-limited result; the other 12 token test files pass. No dependencies or lockfiles changed.

Browser accessibility and visual suites, application builds, MCP CLI tests and evals remain for PR CI under worker policy. The new nav-route-matching.a11y.spec.js provides browser axe coverage in dark, light and high_contrast. No browser suite or baseline update was run locally.

Registry generation updates kit-registry.json, llms-full.txt and the affected shadcn bundles; registry.json and llms.txt regenerate identically. The broad bundle changes only carry the shared en/es catalog addition plus the changed NavList and StackedLayout sources.

Final review also reproduced two rendered edge cases red before their fixes: separate groups sharing a fallback href key marked two links, and a pattern-only rail button omitted aria-current. The resolved item's identity now serves as the context key, avoiding cross-group collisions; both link and button flyout children use that winner. Both regressions pass in the final focused run.
