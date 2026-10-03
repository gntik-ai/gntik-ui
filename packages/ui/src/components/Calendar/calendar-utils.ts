/**
 * Date helpers for Calendar / DatePicker. Native Date + Intl only; every date is a local
 * calendar day (time stripped to 00:00).
 */

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Adds months, clamping the day to the target month's length (Jan 31 + 1 → Feb 28). */
export function addMonths(d: Date, n: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const day = Math.min(d.getDate(), endOfMonth(target).getDate());
  return new Date(target.getFullYear(), target.getMonth(), day);
}

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const compareDay = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();

/** Months between two dates, ignoring days (Mar → May = 2). */
export const monthDiff = (a: Date, b: Date) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

export function clampDay(d: Date, min?: Date, max?: Date) {
  if (min && compareDay(d, min) < 0) return startOfDay(min);
  if (max && compareDay(d, max) > 0) return startOfDay(max);
  return d;
}

/** `YYYY-MM-DD` for the local day (stable keys, data attributes, form values). */
export function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const startOfWeek = (d: Date, weekStartsOn: WeekDay) => addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
export const endOfWeek = (d: Date, weekStartsOn: WeekDay) => addDays(startOfWeek(d, weekStartsOn), 6);

/** Six weeks (42 days) covering the month, starting on `weekStartsOn`. */
export function monthWeeks(month: Date, weekStartsOn: WeekDay): Date[][] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i)));
}

/** First day of the week for a locale (Intl week info when available, else Monday). */
export function localeWeekStart(locale?: string): WeekDay {
  try {
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return (info.firstDay % 7) as WeekDay;
  } catch {}
  return 1;
}

/** Weekday names starting on `weekStartsOn`: `[{ narrow: 'M', long: 'Monday' }, …]`. */
export function weekdayNames(locale: string | undefined, weekStartsOn: WeekDay) {
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  // 2026-01-04 is a Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 0, 4 + ((weekStartsOn + i) % 7));
    return { narrow: narrow.format(d), long: long.format(d) };
  });
}

export const formatMonth = (d: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d);

export const formatDayLabel = (d: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);

export const formatDate = (d: Date, locale?: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
  new Intl.DateTimeFormat(locale, options).format(d);

/** "Mar 2 – 9, 2026" via Intl.formatRange; an open range shows only its start. */
export function formatDateRange(range: DateRange, locale?: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  const fmt = new Intl.DateTimeFormat(locale, options);
  if (!range.start) return '';
  if (!range.end) return `${fmt.format(range.start)} –`;
  return fmt.formatRange(range.start, range.end);
}

/** Orders a range so start <= end. */
export function normalizeRange(a: Date, b: Date): DateRange {
  return compareDay(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}
