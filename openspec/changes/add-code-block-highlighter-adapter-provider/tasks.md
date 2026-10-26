# Tasks

## 1. Implementation

- [x] Export CodeHighlighter, CodeHighlighterProvider and useCodeHighlighter from the core entry.
- [x] Add whole-source memoization, safe token validation, fallback, shared lazy loads, unmount guards and development-only warnings.
- [x] Add the optional Shiki entry, a colourless internal theme, innermost-first scope mapping, JavaScript regex engine and default/alias/custom grammar loaders.
- [x] Add installation/provider documentation and a live YAML/Python/Go/SQL example, including the languages option and maxHeight.

## 2. Tests

- [x] Exercise public provider rendering, per-line overrides, source preservation, token safety, memoization, asynchronous loading and warning behaviour.
- [x] Exercise the public adapter with real default grammars, aliases, custom loaders and cached failures.
- [x] Check the built public adapter entry, optional peer metadata and absence of Shiki from dist/index.js.
- [x] Check the loaded live example with jsdom axe in dark, light and high_contrast.
- [x] Add a PR CI browser check for real grammar loading, safe styles, copyable public imports and WCAG contrast in all three themes.
- [ ] Run the browser axe suite in PR CI; workers must not launch it.

## 3. Docs and release

- [x] Add one minor changeset for @gntik-ai/ui.
- [x] Regenerate registry and llms output. registry.json and llms.txt were regenerated without content changes.
- [x] Validate the OpenSpec change with --strict.
- [x] Finish bounded validation and create one local commit on the assigned branch.

## Test seams and red evidence

The seams are the CodeBlock public exports and rendered DOM, createShikiHighlighter's public load/tokenize interface with real grammars, the built package export, and the live catalog example. No internal modules are mocked. The fake highlighter implements the consumer-supplied provider boundary; its load promise is controlled deterministically.

`pnpm --filter @gntik-ai/ui test src/components/CodeBlock/CodeHighlighterProvider.test.tsx` failed first because the exports did not exist, then on missing lazy loads/warnings, then on altered text/lines, unsafe kinds and thrown tokenization errors. Each slice passed after its implementation. `pnpm --filter @gntik-ai/ui test src/code-highlight-shiki/code-highlight-shiki.test.ts` failed before the adapter existed. The adapter tests now use actual YAML, Python, Go and SQL grammars. Delimiter scopes are punctuation under the specified innermost-first map; string and comment content keep their own kinds.

`pnpm --filter @gntik-ai/ui test src/components/CodeBlock/CodeBlockHighlighter.example.test.tsx` failed before the example existed, then passed with all four grammars loaded and axe in each theme. `node packages/ui/tests/code-highlight-shiki-build.test.mjs` failed before the export existed and then caught optional-adapter documentation text entering the core runtime. Adapter-specific prose is therefore a separate export from CodeBlock.doc.ts consumed only by the catalog. `node --test packages/ui/tests/code-highlight-shiki-build.test.mjs` passes after the build.

## Validation limits

The prescribed library unit command stops at the unchanged tokens mirror-install suite: the public registry is unavailable, and its offline fallback packs the current 0.3.0 package but attempts to read gntik-ai-tokens-0.2.1.tgz, producing ENOENT. This is reported as SKIPPED because of the offline environment. The nine other tokens suites and all remaining permitted library suites are run separately. No unrelated test or fixture is changed.

Browser a11y/visual suites and the MCP CLI/evals suites are reserved for PR CI under worker policy. The focused browser check has been added but not executed locally; jsdom axe does not validate colour contrast. No deployment or publishing steps are involved.

## Final local validation

The library build, monorepo typecheck, registry freshness, both consumer kit-only checks, docs coverage, docs build, strict OpenSpec validation and formatting pass. All ten permitted library packages excluding tokens pass their complete unit suites; all nine non-installation tokens suites also pass. The 35 focused provider/adapter/example tests and the built-package check pass on the final source. Lint exits successfully with one warning for the intentionally required loadRevision memo dependency, which refreshes tokens after the external highlighter cache changes.

The prescribed recursive unit command is SKIPPED because its tokens mirror-install suite cannot complete offline (ENOENT for gntik-ai-tokens-0.2.1.tgz after packing the current version). Full monorepo tests, MCP CLI/evals and browser a11y/visual suites remain for PR CI. No browser suite was launched locally. The core bundle contains no Shiki reference and the optional built adapter loads YAML successfully.
