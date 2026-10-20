# Tasks

## Implementation

- [x] Add and export foldText, matchText, matchRanges and MatchTextOptions with TSDoc.
- [x] Adopt matching in CommandPalette, MultiSelect, TransferList, WorkspaceSearch, PowerSearch, QueryBuilder, JsonViewer and async picker examples.
- [x] Adopt matching and original-offset highlights in LogViewer, with memoised folded lines.
- [x] Adopt matching in search-results, help-home, resource-gallery, resource-index, audit-log, keyboard-shortcuts, usage-analytics and incident-board; preserve exact facets.

## Tests

- [x] Reproduce MultiSelect typing funcion at d2d68487 before changing source.
- [x] Add fold-table, mode, whitespace, decomposed-input and original-offset utility tests.
- [x] Add component, public query helper, highlighter and eight template-helper regressions, watching each fail before its fix.
- [x] Add semantic axe checks for the utility example in three themes and browser checks for CI.
- [x] Run the required repository validation commands and record environment limitations.

## Docs and release

- [x] Add a live utility docs example and en/es labels.
- [x] Add one changeset with patches for UI, blocks and templates.
- [x] Regenerate registry output and check for drift.
- [x] Validate this OpenSpec change in strict mode.

## Validation evidence

The original MultiSelect reproduction command was `pnpm --filter @gntik-ai/ui test src/components/MultiSelect/MultiSelect.test.tsx` at base d2d68487. It failed because typing `funcion` removed the `Función` option: lowercase-only comparison preserves the accent. Both highlighter regressions also reproduced `tanb` instead of `stan` for `İstanbul`, confirming that lowercase-string offsets were applied to original text. All new component/helper regressions pass after the fixes.

Library builds, lint, monorepo typecheck, registry drift, strict OpenSpec validation, docs coverage and both consumer kit-only checks pass. The focused final UI run passes 37 tests. The utility example passes semantic axe checks in dark, light and high_contrast; jsdom does not check colour contrast.

The required recursive library test command stops at the existing token mirror-install test: its loopback HTTP server cannot bind (`listen EPERM` on `127.0.0.1`). The four other token test files pass. All ten remaining library packages pass the separate recursive run with tokens excluded, including the complete UI, blocks and templates suites.

Browser `pnpm a11y` cannot start the preview because `apps/docs/dist` is absent. PR CI must run browser axe/contrast checks in all three themes, including the new matching example and changed async examples. Full monorepo tests, MCP/evals tests and app builds remain in PR CI under the standing sandbox policy. No visual baselines or safety gates were changed.
