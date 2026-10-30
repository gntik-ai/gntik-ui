# Change: Upgrade Base UI to 1.9.0

## Why

Issue #141, risk R2. Base UI 1.9.0 fixes asynchronous highlighting, overlapping toast timer pauses, drawer gestures and accessible label precedence beneath the kit's wrappers.

## What changes

- Declare `@base-ui/react` at `^1.9.0` in `@gntik-ai/ui`; resolve workspace consumers to 1.9.0 and its `@base-ui/utils` 0.5.0 dependency.
- Retain the docs regression aliases `@gntik-ai/ui-baseline` and `@gntik-ai/blocks-baseline` at published 0.5.0. Their transitive Base UI 1.8.0 and utils 0.4.0 are the sole permitted older copies. No overrides or resolutions.
- Preserve existing virtualized navigation assertions and timeouts by fixing the wrapper's batched arrow navigation.
- Document explicit `aria-label` precedence on Checkbox, Switch and Radio, with consistent-label live examples and English/Spanish catalog strings.
- Cover overlapping toast hover/focus, late search results followed by Enter, swipe backdrop progress and threshold, and nested-dialog Escape through public interactions.
- Add a minor UI changeset and regenerate the kit registry.

## Scope and risk

Only capability `ui/base-ui-dependency` changes; all deltas are ADDED. Menu filtering, other new 1.9 APIs, other dependency upgrades, baseline alias changes, overrides, releases and deployment are excluded. Explicit accessible labels must include their visible label's words to satisfy WCAG 2.5.3. The caret range can admit future 1.x minors in consumer installs; `~1.9.0` remains an operator question, with `^1.9.0` the approved default. Rollback is a revert or consumer pin to the previous UI minor.

Browser axe in dark, light and high_contrast and visual suites run in PR CI under worker policy. Baselines must remain unchanged unless the operator refreshes them with a stated reason. Physical touch swipes, on-screen keyboards and Android back/CloseWatcher are operator checks.
