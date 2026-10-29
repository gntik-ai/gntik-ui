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

| Assertion                                                                 | Old value                   | New value        | Installed source                                                                                                                                                              |
| ------------------------------------------------------------------------- | --------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SettingsLayout/Baseline.test.tsx, saveBar omitted                         | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471` selects `visuallyHidden` for an unnamed input                                                                                                 |
| SettingsLayout/Baseline.test.tsx, saveBar empty-string                    | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| SettingsLayout/Baseline.test.tsx, saveBar empty-fragment                  | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| SettingsLayout/Baseline.test.tsx, saveBar null                            | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| resource-detail/Page.default.test.tsx, original default shell             | hidden input `margin: -1px` | `margin: 0px`    | `select/root/SelectRoot.js:471`                                                                                                                                               |
| Same original default shell assertion, enabled native Collapsible trigger | `aria-disabled="false"`     | attribute absent | `collapsible/trigger/CollapsibleTrigger.js:45` uses the native button helper; `utils/useFocusableWhenDisabled.js:38` omits aria-disabled on an ordinary enabled native button |

The Select style's `margin: 0` originates in `node_modules/.pnpm/@base-ui+utils@0.5.0_*/node_modules/@base-ui/utils/visuallyHidden.js:21`. The hidden inputs retain aria-hidden and tabindex -1. The trigger retains its name, native button role, tabindex, aria-controls and aria-expanded. Existing SettingsLayout, Collapsible and ResourceDetail keyboard/name/state tests plus axe contracts cover the preserved public behavior. The TimePicker frozen markup and the explicit ResourceDetail shell snapshot pass unchanged. These are DOM fixtures, not visual baselines.

## Deterministic timer follow-up

The full UI command `VITEST_MAX_WORKERS=2 pnpm --filter @gntik-ai/ui test --reporter=verbose` also reproduced the existing action-focus test's wall-clock race: its 150 ms toast disappeared before setup completed under load, yielding “Unable to find an accessible element with the role dialog and name Saved draft”. The focused overlapping-interaction regression already passed. The existing action-focus test now pins the clock during setup, verifies the actual action has focus, advances the same 400 ms pause and 150 ms remaining timeout, and then flushes the removal animation frame. Its original visibility, focus and dismissal expectations are retained; no timeout increases, retries or skipped tests are introduced. F6/Tab navigation remains covered by the unchanged primary/dismiss-action keyboard test. All eight Toast.actions tests pass after this timing fix.

## Final validation and handoff

Library builds, monorepo lint and typecheck, registry freshness, docs coverage, both consumer kit-only checks and strict OpenSpec validation pass. The final 14-file UI run passes all 128 focused tests, including the unchanged virtualized tests, labels, async selection, toast timers, swipes, nested Escape, Collapsible and SettingsLayout contracts. ResourceDetail's two frozen-markup and 15 behavior tests pass without snapshot-update mode. The other 12 token test files pass.

The prescribed recursive library unit command cannot complete in this no-network worker: the unchanged token mirror-install fallback packs the current 0.3.0 package but then reads the missing `gntik-ai-tokens-0.2.1.tgz` (ENOENT). Additional aggregate library runs stalled, and the sandbox subsequently refused process creation with `spawn sh EAGAIN`, `Cannot fork` and `failed to fork for bubblewrap: Resource temporarily unavailable`. Full UI/blocks/chat/templates suite completion remains a PR CI check. The verbose UI diagnostic run reproduced the timer-test race above; its final focused rerun passes after the fake-clock correction. No assertion failure is classified as an environment skip.

Browser axe and visual suites are not launched under worker policy; their existing baselines are unchanged. Physical touch, on-screen keyboard and Android back checks remain operator work. No test has skip/retry markers added, and no existing virtualized assertion or timeout is edited.

Registry generation updates kit-registry.json, llms-full.txt and the shadcn item bundles, including their Base UI 1.9 dependency declarations and localized label examples. registry.json and llms.txt are regenerated without content changes. Generated output retains generator-owned formatting; Prettier formats the authored files, with raw DOM snapshot fixtures left byte-exact.
