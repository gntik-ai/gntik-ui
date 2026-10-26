# Tasks

## 1. Implementation

- [x] Export CodeHighlighter, CodeHighlighterProvider and useCodeHighlighter from the core entry.
- [x] Add whole-source memoization, safe token validation, fallback, shared lazy loads, unmount guards and development-only warnings.
- [x] Add the optional Shiki entry, a colourless internal theme, innermost-first scope mapping, JavaScript regex engine and default/alias/custom grammar loaders.
- [x] Add installation/provider documentation and a live YAML/Python/Go/SQL example, demonstrating an additional TOML grammar through languages and maxHeight.

## 2. Tests

- [x] Exercise public provider rendering, per-line overrides, source preservation, token safety, memoization, asynchronous loading and warning behaviour.
- [x] Exercise the public adapter with real default grammars, aliases, custom loaders and cached failures.
- [x] Check the built public adapter entry, optional peer metadata and absence of Shiki throughout the dist/index.js import graph in the normal Vitest suite.
- [x] Check the loaded live example with jsdom axe in dark, light and high_contrast.
- [x] Add a PR CI browser check for real grammar loading, safe styles, copyable public imports and WCAG contrast in all three themes.
- [ ] Run the browser axe suite in PR CI; workers must not launch it.

## 3. Docs and release

- [x] Add one minor changeset for @gntik-ai/ui.
- [x] Regenerate registry and llms output, including apps/docs/public/r/registry.json, kit-registry.json, llms.txt and llms-full.txt changes. The first sentence includes the optional peer and import path so short discovery listings expose the adapter too. The legacy root registry.json was regenerated without content changes.
- [x] Validate the OpenSpec change with --strict.
- [x] Finish bounded validation and create one local commit on the assigned branch.

## Test seams and red evidence

The seams are the CodeBlock public exports and rendered DOM, createShikiHighlighter's public load/tokenize interface with real grammars, the built package export, and the live catalog example. No internal modules are mocked. The fake highlighter implements the consumer-supplied provider boundary; its load promise is controlled deterministically.

The original implementation used red/green tests for provider exports, lazy loads/warnings, source preservation, token safety, thrown tokenizer errors and real grammars. This revision retains those public seams.

`pnpm --filter @gntik-ai/ui test src/code-highlight-shiki/code-highlight-shiki.test.ts -t 'loads YAML'` reproduced the delimiter bug twice before the fix: the expected string token containing the complete quoted value was instead three tokens with punctuation quotes. Ranked hypotheses were (1) generic innermost punctuation mapping overriding string/comment scopes, (2) missing Shiki explanations, and (3) token coalescing changing the kind. The observed punctuation/string/punctuation output ruled out missing explanations; matching punctuation.definition.string and punctuation.definition.comment before generic punctuation confirmed the first cause. Complete YAML strings/comments and Python triple-quote delimiters now retain their enclosing kind without changing text. The full adapter test command passes after the fix.

The example metadata test failed on missing `pnpm add shiki` guidance before moving adapter documentation into the shared `doc.description`; a further red test ensured the install and entry path also appear in the leading sentence used by short discovery listings. The core exports the lightweight codeBlockDoc metadata, allowing the full discovery documentation to be tree-shaken from the runtime. The catalog now reads docs generically; registry and llms consumers receive installation, entry-path, languages and maxHeight guidance too. A new example test failed on the missing TOML region before adding the additional grammar and preview.

The old manual node:test build check is replaced by src/code-highlight-shiki/shiki-entry.test.ts, discovered by the package's existing Vitest include. It traverses the built core import graph and verifies the optional peer, export and built adapter/declaration files. Adapter grammar behavior remains covered through the public load/tokenize API.

Lifecycle tests now assert no late warning after unmount and no retokenization when a former provider finishes loading. Temporarily removing the active guard made both tests fail (one late warning and two tokenize calls instead of one). The mutation was removed and the tests pass with the existing guard. The memoization test uses one render helper with an explicit instance parameter.

## Validation limits

The previous maker reported an offline tokens mirror-install limitation; the independent checker subsequently passed all 37 tokens tests at the same HEAD. This revision reran the prescribed complete library unit command and independently reproduced the offline limit: test/mirror-install.test.mjs packs the current 0.3.0 package after the public registry is unreachable, then tries to read gntik-ai-tokens-0.2.1.tgz and gets ENOENT. The diagnostic command was `cd packages/tokens && node --test --test-isolation=none test/mirror-install.test.mjs`; the unmodified `node --test test/mirror-install.test.mjs` was also run. This is an environment-dependent incomplete check, reported as SKIPPED. All nine non-installation token test files pass. No unrelated test or fixture is changed.

Browser a11y/visual suites and the MCP CLI/evals suites are reserved for PR CI under worker policy. The focused browser check has been added but not executed locally; jsdom axe does not validate colour contrast. No deployment or publishing steps are involved.

## Final local validation

The library build, monorepo lint (zero warnings), typecheck, registry freshness, both consumer kit-only checks, complete docs node tests (including docs coverage), docs build, strict OpenSpec validation and formatting pass. All ten permitted library packages other than tokens pass their complete unit suites, including UI, blocks, chat and templates. All nine non-installation tokens test files pass. The 29 focused adapter/provider/example/build-entry tests pass, including jsdom axe in all three themes. The loadRevision dependency has a documented, targeted exhaustive-deps suppression: a successful load mutates the external grammar cache while the highlighter instance stays stable.

The prescribed recursive unit command is SKIPPED because of the independently reproduced offline mirror-install ENOENT described above; remaining packages were tested with the same recursive filters plus !@gntik-ai/tokens. Browser a11y/visual suites, MCP CLI/evals tests and Next.js app builds remain SKIPPED for PR CI under worker policy. No browser suite was launched locally. One existing minor changeset is retained; no dependencies, lockfiles, release configuration or visual baselines are changed in this revision.
