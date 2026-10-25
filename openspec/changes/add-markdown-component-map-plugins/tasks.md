# Tasks

## 1. Implementation

- [x] 1.1 Add component maps, code renderers with completion, plugins and streaming context.
- [x] 1.2 Add a linear custom-block pre-scan, single-document remark transform and lazy private HTML subset pipeline using resolved dependencies.
- [x] 1.3 Export public types/hook and document stable references and untrusted content.

## 2. Tests

- [x] 2.1 Add public Markdown tests for overrides, URL safety, fences, tags, no prose loss, parse count, plugins, HTML subset and context.
- [x] 2.2 Add MarkdownCustom axe tests for all three themes and Spanish rendering.

## 3. Docs and release

- [x] 3.1 Add bilingual live example and one changeset (chat minor, ui translation patch).
- [x] 3.2 Regenerate registry output and run required repository checks (environment exclusions recorded below).
- [x] 3.3 Validate this OpenSpec change strictly and create one local commit.

## Test seams and red evidence

The public Markdown component's DOM, renderer props and plugin-visible trees are the acceptance seams. Tests do not mock internal collaborators. `pnpm --filter @gntik-ai/chat exec vitest run src/Markdown/Markdown.test.tsx` failed before each implementation slice: missing overrides/context and plugin ordering, absent code renderer props, absent custom blocks, and the absent HTML subset. The example tests also ran before the live preview existed.

An indented streaming fence regression ran red with `pnpm --filter @gntik-ai/chat exec vitest run src/Markdown/Markdown.test.tsx -t 'marks a repaired'`: HAST's code position starts after indentation, whereas the repair match starts before it. Completion tracking now compares the actual fence marker offset. A quoted-attribute test ran red before allowing angle brackets inside quoted custom-tag attribute values.

Markdown.defaults.test.tsx contains a DOM snapshot captured by rendering the immutable pre-extension source at 51a42eda, then tested against the new renderer. The temporary original-source copy was removed. Both Markdown files cover default DOM stability, the 800-line single-parse regression and axe checks in all three theme settings. The follow-up replaces the wall-clock ratio with a deterministic parse-count bound, including a registered block. jsdom axe excludes computed colour contrast; browser contrast and visual suites run in PR CI under worker policy.

The library output retains dynamic imports of rehype-raw and rehype-sanitize. The docs production build emits separate rehype-raw and rehype-sanitize chunks, preserving lazy loading. Registry generation includes the new helper files and resolved dependencies. The generated shadcn registry embeds the changed source and is committed alongside the kit registry output.

The prescribed recursive unit command cannot complete the unchanged tokens mirror-install test without network: its offline fallback packs version 0.3.0 and then attempts to read gntik-ai-tokens-0.2.1.tgz, raising ENOENT before its assertions. The six offline token suites pass. The mirror test and the recursive command are recorded as SKIPPED for this environment. MCP CLI/evals tests, Next app builds and browser suites remain PR CI checks.

All ten remaining library package suites pass with `pnpm -r --filter './packages/**' --filter '!@gntik-ai/tokens' --filter '!@gntik-ai/gntik-ui-mcp' --filter '!@gntik-ai/evals' test`. Lint, monorepo typecheck, changed-file formatting, registry freshness, docs coverage, strict OpenSpec validation and both consumer kit-only checks pass.

## Checker follow-up

The public Markdown seam reproduced both blocking defects before their fixes:

- `pnpm --filter @gntik-ai/chat exec vitest run src/Markdown/Markdown.test.tsx -t 'keeps the code Copy'` failed after a streaming rerender reset the button's copied state. A module-level pre renderer now reads current renderer maps and fence offsets from context, preserving the button, focus and copy feedback.
- `pnpm --filter @gntik-ai/chat exec vitest run src/Markdown/Markdown.test.tsx -t 'preserves footnote'` failed because reference links and footnote prose disappeared across a registered tag. Registered delimiter lines are now masked without changing offsets; a kit remark transform wraps nodes from one shared document. Definitions work across tags, including with the HTML subset loaded.

The redundant Fragment is removed. An additional red-before-green test keeps ordinary div overrides independent of registered custom tags. Internal custom wrappers survive the fixed sanitiser, while raw HTML still passes the original subset filter. The existing single changeset remains chat minor and ui patch.

## Footnote navigation checker follow-up

`pnpm --filter @gntik-ai/chat exec vitest run src/Markdown/Markdown.test.tsx -t 'footnote'` reproduced the remaining defect before the source fix: two tests failed because the footnote reference's fragment target did not exist with `allowHtml` enabled. The public DOM seam now checks both reference and back-reference targets across custom tags, plus navigation in a plain Markdown footnote reply after the HTML subset loads. It also checks the accessible footnote label and section class.

The confirmed cause was the HTML sanitiser stripping list-item IDs, applying its default clobber prefix to already-prefixed GFM reference IDs and the accessible label reference, and stripping the footnotes section class. The fixed private schema preserves those Markdown-generated attributes and disables redundant clobbering. Raw HTML still passes the narrower subset filter first; a regression verifies raw a, li, h2 and section elements cannot supply competing IDs, and subset elements cannot supply IDs or names.

Both Markdown suites pass (65 tests), including default DOM stability, safety, all three example themes and the existing deterministic 800-line parse-count bound. No scanner change is needed: the accepted parse-count regression remains, and the checker independently confirmed the scan is linear. The existing single changeset is updated and `pnpm registry` refreshes the embedded Markdown source; other generated registry files are unchanged.

The required recursive library test command again stops in the unchanged tokens mirror-install test. Direct execution confirms ENOENT for gntik-ai-tokens-0.2.1.tgz after the unavailable public-registry request falls back to packing the current 0.3.0 package. This occurs before the install assertions; the command is SKIPPED as an offline environment limitation. The other six token test files pass. Browser suites, MCP CLI/evals tests and Next.js builds remain PR CI checks under worker policy.

Final validation passes: all library builds, lint, monorepo typecheck, all ten library package suites excluding tokens/MCP/evals, registry freshness, both consumer kit-only checks, docs coverage, strict OpenSpec validation and changed-file formatting. No dependency or lockfile changes are needed.
