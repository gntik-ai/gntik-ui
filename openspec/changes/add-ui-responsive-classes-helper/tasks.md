# Tasks

## 1. Implementation

- [x] 1.1 Add and export the shared responsive helpers and canonical types.
- [x] 1.2 Adopt the helper in Grid, add 2xl and responsive gap, rowGap and columnGap tables.
- [x] 1.3 Add responsive Section padding tables and preserve scalar variants.
- [x] 1.4 Document helpers, literal tables, Grid and Section; add translated live examples.

## 2. Tests

- [x] 2.1 Test helpers with red before green at their public function seam.
- [x] 2.2 Verify Grid and Section rendered classes, scalar compatibility and breakpoint type exports.
- [x] 2.3 Compile scanned source candidates with Tailwind and verify new selectors.
- [x] 2.4 Check example axe contracts in three themes and Spanish catalog rendering in jsdom.

## 3. Docs and release

- [x] 3.1 Add a minor @gntik-ai/ui changeset.
- [x] 3.2 Regenerate registries and run bounded repository checks (mirror integration deferred below).
- [x] 3.3 Validate this change with openspec --strict.
- [ ] 3.4 Run browser accessibility suites in PR CI (worker policy).

## Sandbox handoff

- The follow-up worker rerun still stops at the tokens mirror-install integration: the public
  registry is unreachable and its offline fallback cannot find `gntik-ai-tokens-0.2.1.tgz` (ENOENT).
  The other 12 token test files pass. This environment limit was reproduced with
  `node test/mirror-install.test.mjs` from `packages/tokens`; the checker reported a passing run
  in its environment. The remaining library packages run separately without tokens.
- Fixed responsive padding overriding the divided Section body's `gap-0`. Before the fix,
  `pnpm --filter @gntik-ai/ui test src/components/Section/Section.test.tsx` failed five assertions
  at the rendered Section seam. After skipping responsive body gaps for divided Sections, all
  19 tests pass, including exact scalar/base-object body class parity for every padding step.
- Browser suites run in PR CI. The new `responsive-values.a11y.spec.js` checks the live Grid,
  Section and helper examples in all three themes, including contrast and catalog reachability.
