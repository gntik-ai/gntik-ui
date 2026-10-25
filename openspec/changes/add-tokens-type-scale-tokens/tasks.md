# Tasks

- [x] Add the eleven CSS roles, Tailwind aliases and package export.
- [x] Extend DTCG, Figma, TypeScript and declaration exports.
- [x] Configure cn/tv font-size merging and adopt roles in Text and Heading.
- [x] Add token, export, component and merge tests with red before green.
- [x] Add catalog documentation, translated examples and computed-style/axe coverage for all three themes.
- [x] Add one changeset with minor entries for tokens and UI and a patch entry for the sign-in template fix.
- [x] Regenerate the kit registry and run bounded validation. The previous independent checker passed all seven toolchain gates, including the full library unit suite, in a scratch worktree.
- [x] Reproduce the sign-in headline regression at the rendered SignInPage seam before fixing it: `pnpm --filter @gntik-ai/templates exec vitest run src/sign-in/Page.test.tsx` failed twice because the literal size removed the role's weight and tracking. Explicit font-bold and tracking-tight restore the base appearance; the regression passes afterward.
- [x] Document literal-size override behavior in the translated Text/Heading description and live examples, repair the generated Text summary, and split existing preview translations out of the nearly full catalogs without changing their values.
- [ ] PR CI runs browser accessibility, computed styles and visual baselines. The foundations table intentionally adds four rows; its baselines require an operator refresh on the CI runner. The sign-in headline must retain its existing baseline.

## Follow-up validation

Library build, lint, typecheck, registry consistency, docs coverage, formatting, strict OpenSpec validation and both consumer kit-only checks pass in the assigned worktree. All ten other library suites and the seven token test files that do not require a registry pass. The full library unit gate cannot complete offline: mirror-install.test.mjs cannot fetch the pinned public tarball, then its local fallback packs version 0.3.0 but reads gntik-ai-tokens-0.2.1.tgz (ENOENT at line 93). This environment limitation remains assigned to PR CI; it does not replace the earlier independent checker's passing result.
