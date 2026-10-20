# Tasks

## Reproduction and API gate

- [x] Verify the clean assigned worktree and base 12de06c12b7d8b49130964ea442f85e05eb3e12d.
- [x] Reproduce the en-US month header bug before changing source.
- [x] Reproduce the 12-hour formatting bug before changing its source.
- [x] Identify the existing incompatible public localeHourCycle contract and remove the trial implementation.
- [ ] Obtain an amended OpenSpec preserving the existing public numeric helper, or approving a distinct string-helper name.

## Implementation (blocked)

- [ ] Export localeWeekStart and resolve the localeHourCycle API conflict.
- [ ] Add and export a locale weekend helper with Intl weekday mapping and fallback.
- [ ] Parameterise scheduling date helpers and add formatHour.
- [ ] Add week-start/hour-cycle props, locale defaults, keyboard alignment and data-weekend.
- [ ] Add regression tests for en-US, es-ES, runtime defaults, overrides and weekend fallback.
- [ ] Add live docs previews for every new prop and public helper.
- [ ] Add exactly one changeset for blocks and ui, regenerate registries, and run final implementation checks.
- [ ] Run browser axe in dark, light and high_contrast in PR CI.

## Reproduction evidence

On pristine source at 12de06c, after building the libraries, a trial test rendered MonthCalendar inside I18nProvider locale="en-US" and asserted that its first column header was Sunday. Command: `pnpm --filter @gntik-ai/blocks test src/scheduling/MonthCalendar/MonthCalendar.test.tsx`. It failed with expected accessible name Sunday, received Monday; the two existing tests passed. Repeating the command reproduced the same failure. A separate trial dates.test.ts asserted formatTime for 09:30 under en-US with h12; expected 9:30 AM, received 09:30. These trial tests and all trial source edits were removed when the public API conflict was confirmed.

Confirmed scheduling cause: fixed Monday-first headers, grids and navigation in MonthCalendar and shared dates.ts, plus forced h23 formatting and a manually padded WeekCalendar gutter. The existing ui helper could address clock defaults compatibly, but it returns numbers, whereas this approved OpenSpec requires strings from the same public export name.

The handoff contains only the requested OpenSpec documents; source and existing tests remain at the assigned base. It does not claim that the scheduling fix is complete.

## Handoff validation

The original package-root helper was also checked after restoring and rebuilding the base sources: en-US returns 12 and es-ES returns 24. This confirms that a new string-returning helper with the same name would change an existing public API.

Library builds, lint, registry drift, docs coverage, formatting, strict OpenSpec validation and both consumer kit-only checks pass. The required recursive library test command cannot complete because the tokens mirror-install test cannot bind its local HTTP server: listen EPERM on 127.0.0.1. Browser a11y cannot start because apps/docs/dist is absent; PR CI must build the docs and run browser axe in all three themes. No screenshots, lockfiles, package versions, release configuration or protected files were changed.

Monorepo typecheck passes. All ten remaining library packages pass the separate recursive test run excluding tokens (and the MCP/evals exclusions required by sandbox policy), including the complete ui, blocks and templates suites. Full monorepo tests and app builds remain in PR CI under the standing sandbox policy. These results validate the documentation-only handoff and unchanged base source, not a completed scheduling implementation.
