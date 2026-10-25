# Tasks

## 1. Implementation

- [x] 1.1 Add packages/tokens/src/typography.css, import it and the `@theme inline` bridge in src/tailwind.css, and export `./typography.css`.
- [x] 1.2 Map `textVariants` and `headingVariants` in packages/ui/src/components/Text/text.variants.ts to the role utilities.
- [x] 1.3 Extend `readModel`, `toDtcg`, `toFigma` and `toTs` in packages/tokens/scripts/export-tokens.mjs, and list the roles in apps/docs/src/catalog/foundations.jsx.

## 2. Tests

- [x] 2.1 packages/tokens/test/typography.test.mjs: roles, values, units and bridge coverage.
- [x] 2.2 packages/tokens/test/export.test.mjs: the typography group, the Figma variables and `typeScale`.
- [x] 2.3 Text.test.tsx: one role class per variant and size; a Playwright check of computed styles on the catalog previews.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/tokens`, `@gntik-ai/ui` (and patch for the existing sign-in template correction).
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-tokens-type-scale-tokens --strict`.

## Review corrections

- [x] Reproduce the fresh-checkout docs failure before changing source. `node apps/docs/test/foundations-build.test.mjs` failed at the real Vite build boundary when the filesystem guard rejected generated token exports. The foundations table now reads the source-backed typography CSS, preserving its displayed values, with the regression included in the docs test command.
- [x] Restore the foundations header comment before imports and regenerate its registry header. Remove the redundant fourth table column.
- [x] Reproduce the exporter's opaque TypeError for an unsupported typography variable via `node packages/tokens/test/export.test.mjs`, then add an explicit diagnostic and verify the regression passes.
- [x] Retain the specified minor release and documented whole-role replacement for font-size overrides. This follows the acceptance criterion requiring size conflicts to resolve to the later utility. Explicit weight, tracking and leading utilities preserve defaults when consumers need them.
- [x] Keep independent literal role lists in tests as specification oracles, and static utility names in the catalog and merge configuration for Tailwind scanning and merging.
- [x] Extend the existing browser spec to verify computed typography on the actual sign-in template in all three themes, beyond its class-name unit assertion.
- [ ] PR CI runs browser accessibility, computed styles and visual baselines. New foundations rows and the TypographyRoles example intentionally change catalog screenshots; the operator must refresh those baselines on the CI runner. Do not commit screenshots here. Existing component and sign-in rendering must retain their baselines.

## Validation limits

The required library unit command encounters the existing offline mirror-install limitation: the public 0.2.1 tarball is unavailable, and its local fallback packs the current 0.3.0 package but attempts to read gntik-ai-tokens-0.2.1.tgz (ENOENT). PR CI must run the complete unit gate with registry access. Browser suites and the mcp/evals suites run in PR CI; they are not run on this worker.
