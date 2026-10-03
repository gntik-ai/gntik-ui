import { addDays, addMonths, endOfMonth, isSameDay, startOfDay, startOfMonth, type DateRange } from '../Calendar/calendar-utils';

export interface DateRangePreset {
  id: string;
  label: string;
  /** Range relative to "today"; omit for the "Custom" entry, which hands focus to the calendar. */
  range?: (today: Date) => DateRange;
}

/** Today, Last 7 days, Last 30 days, This month (to date), Last month, Custom. */
export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: 'today', label: 'Today', range: (t) => ({ start: startOfDay(t), end: startOfDay(t) }) },
  { id: 'last-7', label: 'Last 7 days', range: (t) => ({ start: addDays(t, -6), end: startOfDay(t) }) },
  { id: 'last-30', label: 'Last 30 days', range: (t) => ({ start: addDays(t, -29), end: startOfDay(t) }) },
  { id: 'this-month', label: 'This month', range: (t) => ({ start: startOfMonth(t), end: startOfDay(t) }) },
  {
    id: 'last-month',
    label: 'Last month',
    range: (t) => {
      const m = startOfMonth(addMonths(startOfMonth(t), -1));
      return { start: m, end: endOfMonth(m) };
    },
  },
  { id: 'custom', label: 'Custom' },
];

/** The preset whose range equals `value`, if any. */
export function matchPreset(presets: DateRangePreset[], value: DateRange, today: Date) {
  return presets.find((p) => {
    const r = p.range?.(today);
    return !!r && isSameDay(r.start, value.start) && isSameDay(r.end, value.end);
  });
}
