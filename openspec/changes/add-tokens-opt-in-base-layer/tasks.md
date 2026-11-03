# Tasks

## 1. Implementation

- [ ] 1.1 Add packages/tokens/src/base.css and the `./base.css` export in packages/tokens/package.json.
- [ ] 1.2 Use `[position:var(--backdrop-position,fixed)] min-h-dvh` in the backdrop slot of the dialog, drawer, bottom-sheet, command-palette and lightbox variants in packages/ui/src/components.
- [ ] 1.3 Import base.css in apps/docs/src/styles.css (removing lines 37-46), apps/example-vite, apps/sandbox and the two kit-only apps, and drop the body classes from their index.html.
- [ ] 1.4 Add the import to `CSS_IMPORTS` and `IMPORT_TARGETS` in packages/cli/src/commands/init.ts and remove the body classes from the Next.js snippet.

## 2. Tests

- [ ] 2.1 packages/tokens/test/base.test.mjs: only `var(--…)` values, `@layer base`, the `@supports` block, and no import from tailwind.css.
- [ ] 2.2 packages/cli/test/init.test.ts: the import is added once and a second init leaves the CSS unchanged.
- [ ] 2.3 apps/docs/e2e: body colours per theme, the gutter attribute, root isolation below an open Popover and the backdrop position.

## 3. Docs and release

- [ ] 3.1 Add a changeset (`pnpm changeset`): minor for `@gntik-ai/tokens`, `@gntik-ai/ui`, `@gntik-ai/cli`.
- [ ] 3.2 Run `pnpm registry` and commit the generated files.
- [ ] 3.3 Run `openspec validate add-tokens-opt-in-base-layer --strict`.
