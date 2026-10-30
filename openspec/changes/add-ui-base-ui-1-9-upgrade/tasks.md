# Tasks

## 1. Implementation

- [x] 1.1 Upgrade the UI manifest to ^1.9.0 and use the platform-resolved lockfile (882209c0).
- [x] 1.2 Preserve virtualized keyboard navigation in the wrapper without changing the four named regression tests or timeouts.
- [x] 1.3 Document Checkbox, Switch and Radio label precedence and demonstrate consistent labels with en/es messages.

## 2. Tests

- [x] 2.1 Verify visible-only and explicit-label accessible names through getByRole.
- [x] 2.2 Cover overlapping toast hover/focus and late CommandPalette/WorkspaceSearch results followed by Enter.
- [x] 2.3 Cover Drawer/BottomSheet swipe backdrop progress, below/above-threshold release and nested-dialog Escape.
- [x] 2.4 Run final bounded repository checks and record environment limits below.
- [ ] 2.5 Run browser axe in all three themes and visual checks in PR CI (worker policy).
- [ ] 2.6 Operator: verify physical touch swipes, on-screen keyboard behavior and Android back/CloseWatcher.

## 3. Docs and release

- [x] 3.1 Add exactly one minor changeset for @gntik-ai/ui.
- [x] 3.2 Format changes, regenerate registry output and commit locally.

## Test seams and reproduction

Tests drive exported kit controls through DOM roles/names, focus, keyboard and pointer events. Rerendered public item props model deferred search responses. Fake timers model overlapping toast interactions; geometry and hit-testing are the only mocked swipe boundaries. Live label examples are checked with jsdom axe. No internal collaborator is mocked.

Before changing wrapper source, `pnpm --filter @gntik-ai/ui test src/components/Combobox/Combobox.test.tsx --maxWorkers=1` failed deterministically: End could not find node-10000 and PageDown highlighted node-2 instead of node-8. The existing Home + PageDown scenario minimizes the regression to repeated arrow events during one render batch. Ranked hypotheses were stale Base UI navigation state, incorrect viewport page size, and lost virtualized row registration. Base UI 1.9.0's `floating-ui-react/hooks/useListNavigation.js:348` reconciles its cursor to the committed activeIndex before each event, confirming the first hypothesis. Committing each arrow step fixes the unchanged assertions; choosing the shorter looping path avoids traversing thousands of intermediate rows. Base UI still owns highlight/selection state and the wrapper emits only the final highlight.

The new interaction tests pass on the resolved 1.9 dependency without wrapper changes. Label live examples were added after their public rendering tests first failed on missing example modules. The toast test advances a separate animation frame after the timeout-driven ending state so fake timers observe DOM removal without changing any existing timeout.

## Release-note references

References below use the installed `packages/ui/node_modules/@base-ui/react/CHANGELOG.md`, v1.9.0, the offline source supplied with the dependency. Existing interaction expectations are unchanged.

- Checkbox, Radio Group and Switch: “Prefer aria-label over associated labels” (#5787), CHANGELOG.md:35, 119 and 147.
- Autocomplete and Combobox: “Fix autoHighlight for asynchronous results” (#5818), CHANGELOG.md:29 and 47.
- Toast: “Keep timers paused during overlapping interactions” (#5809), CHANGELOG.md:155.
- Drawer: “Preserve swipe release velocity after a trailing stationary pointer event” (#5658), “Fix swipe release velocity on 120 Hz input” (#5845), and “Handle CloseWatcher close requests from the cancel event” (#5770), CHANGELOG.md:64, 65 and 69.
- Dialog: “Keep parent open when closing a nested dialog in a closed shadow root” (#5780); CHANGELOG.md:59; the focused kit test uses ordinary nested portals.

The retained Base UI 1.8.0 copy belongs exclusively to the unchanged docs 0.5.0 regression aliases, not workspace UI consumers. No browser or visual baseline is edited by this change.

## Internal markup expectation changes

Only the following frozen DOM assertions change. All other snapshot content is retained; no assertion is removed or relaxed. Paths in the source column are relative to `packages/ui/node_modules/@base-ui/react/` (version 1.9.0).

| Assertion                                                                                                | Old value                   | New value        | Installed source                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SettingsLayout/Baseline.test.tsx, saveBar omitted                                                        | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471` selects `visuallyHidden` for an unnamed input                                                                                                 |
| SettingsLayout/Baseline.test.tsx, saveBar empty-string                                                   | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| SettingsLayout/Baseline.test.tsx, saveBar empty-fragment                                                 | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| SettingsLayout/Baseline.test.tsx, saveBar null                                                           | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| resource-detail/Page.default.test.tsx, original default shell                                            | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| Same original default shell assertion, enabled native Collapsible trigger                                | `aria-disabled="false"`     | attribute absent | `collapsible/trigger/CollapsibleTrigger.js:45` uses the native button helper; `utils/useFocusableWhenDisabled.js:38` omits aria-disabled on an ordinary enabled native button |
| settings-profile/Baseline.test.tsx, default editable profile fixture (four hidden inputs)                | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471` selects `visuallyHidden` for an unnamed input                                                                                                 |
| settings-profile/Editable.test.tsx, explicit editable profile fixture (same four hidden inputs)          | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| settings-profile/Baseline.test.tsx, default editable profile fixture, enabled native Collapsible trigger | `aria-disabled="false"`     | attribute absent | `collapsible/trigger/CollapsibleTrigger.js:45`; `utils/useFocusableWhenDisabled.js:38`                                                                                        |
| settings-profile/Editable.test.tsx, explicit editable profile fixture, same native Collapsible trigger   | `aria-disabled="false"`     | attribute absent | `collapsible/trigger/CollapsibleTrigger.js:45`; `utils/useFocusableWhenDisabled.js:38`                                                                                        |

The Select style's `margin: 0` originates in `node_modules/.pnpm/@base-ui+utils@0.5.0_*/node_modules/@base-ui/utils/visuallyHidden.js:21`. The hidden inputs retain aria-hidden and tabindex -1. The trigger retains its name, native button role, tabindex, aria-controls and aria-expanded. Existing SettingsLayout, Collapsible and ResourceDetail keyboard/name/state tests plus axe contracts cover the preserved public behavior. The TimePicker frozen markup and the explicit ResourceDetail shell snapshot pass unchanged. These are DOM fixtures, not visual baselines.

## Deterministic timer follow-up

The full UI command `VITEST_MAX_WORKERS=2 pnpm --filter @gntik-ai/ui test --reporter=verbose` also reproduced the existing action-focus test's wall-clock race: its 150 ms toast disappeared before setup completed under load, yielding “Unable to find an accessible element with the role dialog and name Saved draft”. The focused overlapping-interaction regression already passed. The changed test is `Toast.actions.test.tsx`, “does not auto-dismiss while an action has focus, and resumes after”: real timers and `user.tab()` become fake timers and `action.focus()` during setup. It verifies the actual action has focus, advances the same 400 ms pause and 150 ms remaining timeout, and then flushes the removal animation frame. Its original visibility, focus and dismissal expectations are retained; no timeout increases, retries or skipped tests are introduced. F6/Tab navigation remains covered by the unchanged primary/dismiss-action keyboard test. All eight Toast.actions tests pass after this timing fix.

## Final validation and handoff

The earlier maker's focused checks did not cover the full templates suite. Independent checking found two real settings-profile fixture assertion failures; they were not environment skips. The deterministic reproduction `pnpm --filter @gntik-ai/templates test src/settings-profile/Baseline.test.tsx src/settings-profile/Editable.test.tsx --maxWorkers=1` failed both frozen-DOM assertions before the fixture correction. The confirmed cause was the same Base UI 1.9 internal markup documented above: four hidden-input margins and one enabled native Collapsible trigger attribute. Only these five fixture values change; both test bodies remain unchanged.

The public MCP `usageOf` seam also reproduced the canonical example regression: Checkbox returned CheckboxLabelPrecedence.tsx rather than CheckboxList.tsx. The regression test checks CheckboxList, SwitchSettings and RadioGroupCards as representative usage. Renaming the two new demos to CheckboxWithAccessibleLabel and SwitchWithAccessibleLabel restores ordering for both MCP and generated llms-full.txt, while retaining the live label-precedence previews and their axe tests. The en/es runtime catalog entries remain because the approved spec explicitly requires the live examples to use that catalog; no additional strings are added.

Final follow-up validation passes: library builds, monorepo lint and typecheck, registry freshness, docs coverage, both consumer kit-only checks, strict OpenSpec validation and authored-file Prettier checks. The complete UI, blocks, chat and templates suites pass via `pnpm -r --filter @gntik-ai/ui --filter @gntik-ai/blocks --filter @gntik-ai/templates --filter @gntik-ai/chat test`, with `VITEST_MAX_WORKERS=2` and unchanged test timeouts. This includes both formerly failing settings-profile tests and the four unchanged virtualized tests. `node --test packages/mcp/test/base-ui-usage.test.mjs` passes at the public usage seam. Vitest's unrelated line-wrapping rewrite of the ChatComposer snapshot was verified to preserve its content and restored to the original bytes.

The previous attempt reported the prescribed recursive library test command as SKIPPED as an environment-limited aggregate: the unchanged token mirror setup cannot obtain the published 0.2.1 tarball offline, and its fallback packs the current 0.3.0 package, then raises ENOENT for `gntik-ai-tokens-0.2.1.tgz`. A separate `cd packages/tokens && node --test test/mirror-install.test.mjs` run confirms that unavailable fixture; no assertion failure is classified as a skip. CLI, codemods and icons completed before the aggregate stopped; the remaining untouched library suites still run in PR CI. The action-focus Toast timing test changed in the original implementation is explicitly listed in the deterministic timer follow-up above; all its behavioral expectations remain.

Browser axe and visual suites are not launched under worker policy; their existing baselines are unchanged. Physical touch, on-screen keyboard and Android back checks remain operator work. No test has skip/retry markers added, and no existing virtualized assertion or timeout is edited.

The original upgrade committed kit-registry.json and the shadcn Base UI 1.9 dependency declarations. Regeneration for this follow-up changes only llms-full.txt to restore representative usage; kit-registry.json, registry.json, llms.txt and the shadcn bundles remain current without further content changes. Generated output retains generator-owned formatting; Prettier formats the authored files, with raw DOM snapshot fixtures left byte-exact apart from the five documented values.

## Independent review follow-up

The public Combobox seam now includes React Profiler measurements on 5000 virtualized options with `loopFocus={false}`. Before the follow-up fix, `pnpm --filter @gntik-ai/ui test src/components/Combobox/Combobox.navigation.test.tsx --maxWorkers=1` failed deterministically: End reached node-5000 but triggered 10000 commits (limit 32). The smallest trigger is an open list with its first option highlighted, followed by End. Ranked hypotheses were the disabled loop shortcut, disabled-row scanning, and stale highlight reconciliation. The same test passes with looping enabled; installed `floating-ui-react/hooks/useListNavigation.js:348` confirms why each intervening arrow requires a commit on 1.9. The wrapper previously disabled its shorter route whenever the public loopFocus prop was false.

The wrapper now enables looping only during its already-clamped Home/End/Page navigation transaction, then restores the caller's loopFocus before the next ordinary arrow event. Home from the last row and End from the first row use the boundary shortcut for non-looping lists too. Ordinary ArrowUp/ArrowDown and page navigation remain clamped; the regression test verifies mounted highlights, aria-activedescendant, endpoint clamping, and page movement. A second red-first slice caught End before any highlight with autoHighlight: 10004 commits. Entering directly from the far end fixes it, and Enter selects node-5000. Both tests bound commits rather than asserting machine-dependent wall-clock durations. The four issue-named virtualized tests and their timeouts remain unchanged.

The action-focus toast test retains fake timers to eliminate its wall-clock race, and again uses user.tab() from the F6-focused region to the action. Its Tab transaction drains fake timers inside act so Testing Library's asynchronous event wrapper can settle before the assertions. No production toast behavior, timeout or assertion is loosened. The deferred-item tests keep the public prop-update seam accepted by the checker. The radio demo now follows the same ComponentWithAccessibleLabel naming pattern as Checkbox and Switch, and both message catalogs group the labelPrecedence keys after the common keys. Registry regeneration includes the wrapper source embedded in installable bundles.

### Follow-up validation results

The final source-worktree library build, lint, typecheck, registry freshness, consumer kit-only checks, docs coverage, preview catalog, canonical MCP usage test, strict OpenSpec validation and Prettier checks pass. The direct verbose UI run passes all 230 files and 2108 tests, including the unchanged four issue-named virtualized tests, both new performance regressions and the restored toast keyboard path. The original focused reproduction command also passes both new tests. Blocks, chat and templates pass with `VITEST_MAX_WORKERS=2 pnpm -r --filter @gntik-ai/blocks --filter @gntik-ai/templates --filter @gntik-ai/chat test`; charts, editor and flow pass in a separate scoped run. No test timeout or retry configuration changes.

The prescribed recursive library command remains environment-limited in this worktree: the tokens mirror fixture cannot fetch the published artifact offline, packs local version 0.3.0, then raises ENOENT opening gntik-ai-tokens-0.2.1.tgz. A direct node:test diagnostic with test isolation disabled exposes that exact missing-fixture error before any assertion. This aggregate is reported SKIPPED; the checker's successful run in its separate environment does not reproduce this fixture limitation.

An earlier combined core run reported a UI failure without forwarding Vitest assertion details. Its results cache identifies Combobox.async.test.tsx; every one of that file's twelve tests then passes in the diagnostic verbose full UI run, and the full UI suite exits zero. The exact earlier assertion is unknown and is retained here for CI follow-up; no guessed source fix, relaxed assertion or timeout increase addresses it. The generated ChatComposer snapshot rewrite is only line wrapping and is restored byte-for-byte to HEAD after the chat tests. Browser axe, visual and app-build gates remain PR CI checks, and physical touch, on-screen keyboard and Android back remain operator checks.
