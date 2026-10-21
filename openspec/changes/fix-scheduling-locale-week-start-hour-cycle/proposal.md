# Scheduling locale week starts and clocks

## Why

Scheduling blocks use Monday-first weeks and a 24-hour clock even under an en-US provider. The ui Calendar already resolves its week start from the provider or runtime locale. This change should align MonthCalendar, WeekCalendar and AgendaList with those preferences, with explicit overrides.

## What changes

- Reuse ui locale defaults for scheduling week starts and hour cycles.
- Add weekStartsOn to MonthCalendar and WeekCalendar, and hourCycle to those blocks and AgendaList.
- Rotate month headers, grids, Home/End and week navigation with the resolved week start.
- Mark locale weekends with data-weekend without changing their appearance.
- Add locale regressions, docs previews, a changeset and regenerated registries.

## Amended API contract (2026-10-20)

The existing public localeHourCycle(locale?) continues to return 12 | 24, with its implementation and TimePicker tests unchanged. Only localeWeekStart is newly exported from ui. Scheduling blocks reuse the numeric helper through an internal resolveHourCycle mapping (12 to h12, 24 to h23); no second public helper is added. The weekend helper stays internal to blocks.

Defaults are resolved on every render from useOptionalI18n()?.locale, otherwise undefined for the runtime locale, matching ui Calendar. useI18n still supplies translations, direction and date labels. weekStartsOn uses the existing exported WeekDay type. The API blocker is resolved by the operator amendment.

## Impact

With this change, en-US consumers will default to Sunday-first weeks and 12-hour times. Consumers can retain Monday-first, 24-hour schedules with weekStartsOn={1} and hourCycle="h23". Monday-first, 24-hour locales retain their existing presentation. No deployment or publication is involved.
