# Tasks

## Reproduction and amended API gate

- [x] Verify clean assigned branch at c91671ff4f96111a53c29a6750970795f9c1ca27, on base 12de06c12b7d8b49130964ea442f85e05eb3e12d; preserve the prior commit.
- [x] Apply the operator amendment: preserve numeric localeHourCycle and map its result internally; clear the previous blocker.
- [x] Reproduce en-US Monday-first output before changing source, at the rendered MonthCalendar seam.
- [x] Reproduce h23-only output at the shared date-formatting seam before changing the formatter.

## Implementation

- [x] Export existing localeWeekStart through Calendar and ui root; keep localeHourCycle and its existing tests unchanged.
- [x] Parameterise startOfWeek, weekDays, monthGrid, formatTime and formatRange; add formatHour.
- [x] Resolve provider/runtime defaults per render and reuse WeekDay from ui.
- [x] Add weekStartsOn/hourCycle props, rotate headers, grids, Home/End, initial week, Today and navigation callbacks.
- [x] Mark weekend cells/columns through an internal Intl weekend helper, with Saturday/Sunday fallback and no style changes.
- [x] Cover en-US/es-ES, explicit overrides, keyboard edges, runtime parity and weekend fallback at the public block/helper seams.
- [x] Add live locale/default/override previews and document the public week-start helper.
- [x] Add exactly one changeset with patch bumps for ui and blocks and the no-provider behavior change.
- [x] Regenerate registries and run bounded repository checks; record sandbox limits below.
- [ ] Run browser axe and label-clipping checks in dark, light and high_contrast (PR CI if the sandbox cannot serve built docs).

## Reproduction evidence and cause

Before source changes, `pnpm --filter @gntik-ai/blocks test src/scheduling/MonthCalendar/MonthCalendar.test.tsx` failed deterministically: expected first header Sunday, received Monday under en-US. The es-ES case and existing tests passed. `pnpm --filter @gntik-ai/blocks test src/scheduling/shared/dates.test.ts` reproduced Sunday/Saturday grid failures (expected 29/28 March, received 30 March), then the clock regression (expected 9:30 AM, received 09:30). `pnpm --filter @gntik-ai/ui test src/components/Calendar/locale-exports.test.ts` failed before the export and passed after rebuilding ui.

Ranked hypotheses were fixed week/date helpers (predict Sunday/Saturday failures with Monday passing), provider lookup ignoring regional locale (predict the ui Calendar would disagree under the same provider), and stale build output (predict source and package-root behavior would disagree after rebuilding). The first was confirmed: fixed Monday arithmetic/header and h23 formatting/manual hour padding cause the reported behavior; provider locale was already available for labels. Regressions exercise rendered blocks, real Intl formatting and the package-root export, without internal collaborator mocks.

The earlier c91671f handoff documented the now-resolved public API conflict and removed trial code. It remains in branch history. This amendment preserves the existing numeric helper; no breaking API, dependency, lockfile, release, screenshot or protected-file change is needed.

## Final evidence and sandbox limits

A replay with the regression files copied into a fresh archive of the base scheduling sources produced 16 expected failures and 20 passes across MonthCalendar, WeekCalendar, AgendaList and dates. The en-US failures include Monday instead of Sunday, 09:30 instead of 9:30 AM, wrong Home/End week edges and absent weekend attributes. On the implementation, `pnpm --filter @gntik-ai/blocks test src/scheduling` passes all 38 tests. Runtime parity is checked under simulated en-US and en-GB defaults, without depending on the host locale.

Library builds, monorepo lint and typecheck, registry:check, docs coverage, preview catalog loading, strict OpenSpec validation and both consumer kit-only checks pass. pnpm registry regenerated kit-registry.json, shadcn registry sources and llms files; root registry.json was regenerated and remains byte-identical. The existing numeric localeHourCycle implementation and TimePicker assertions are unchanged. No class changes were made for weekends; the w-14 gutter is retained.

The required recursive library test command stops at the tokens mirror-install test because the sandbox refuses its local HTTP listener: `listen EPERM: operation not permitted 127.0.0.1`. All four other tokens test files pass separately. The separate recursive library run excludes only tokens, MCP and evals and all ten remaining library packages pass, including the full ui, blocks and templates suites. The full repository formatting check also passes.

Browser a11y is deferred to PR CI: `pnpm a11y` cannot start the preview server because apps/docs/dist is absent (`The directory "dist" does not exist. Did you build your project?`). Playwright discovers all nine new scheduling browser cases; they check locale examples, gutter/month label bounds and axe in dark, light and high_contrast. Full monorepo tests/app builds, MCP CLI and evals tests stay in PR CI under the standing sandbox policy. No visual baselines are committed.
