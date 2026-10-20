# Scheduling locale week starts and clocks

## Why

Scheduling blocks use Monday-first weeks and a 24-hour clock even under an en-US provider. The ui Calendar already resolves its week start from the provider or runtime locale. This change should align MonthCalendar, WeekCalendar and AgendaList with those preferences, with explicit overrides.

## What changes

- Reuse ui locale defaults for scheduling week starts and hour cycles.
- Add weekStartsOn to MonthCalendar and WeekCalendar, and hourCycle to those blocks and AgendaList.
- Rotate month headers, grids, Home/End and week navigation with the resolved week start.
- Mark locale weekends with data-weekend without changing their appearance.
- Add locale regressions, docs previews, a changeset and regenerated registries.

## Approval blocker at assigned base 12de06c

The requested new public localeHourCycle(locale?) returning 'h12' | 'h23' conflicts with an existing public export of the same name returning 12 | 24. packages/ui/src/components/TimePicker/time-utils.ts:44 defines the numeric contract; TimePicker/index.ts:2 exports it, and packages/ui/src/index.ts:111 re-exports it at the package root. TimePicker.test.tsx:146-147 explicitly expects 12 and 24.

Adding the requested Calendar export produced a NAMESPACE_CONFLICT warning in the ui build. Replacing the root export would change existing callers' return values and types. The approved patch release and bounded scope do not authorise that breaking change. No source implementation is retained pending a compatible API decision.

Recommended amendment: preserve the existing numeric localeHourCycle export, reuse it in blocks with an explicit mapping to h12/h23, and revise the new-helper requirement accordingly. Alternatively, approve a distinct name for the string-returning helper. The current OpenSpec requires the conflicting name and cannot be implemented as written without breaking its release constraint.

## Impact

Once the API decision is approved, en-US consumers will default to Sunday-first weeks and 12-hour times. Consumers can retain Monday-first, 24-hour schedules with weekStartsOn={1} and hourCycle="h23". Monday-first, 24-hour locales retain their existing presentation. No deployment or publication is involved.
