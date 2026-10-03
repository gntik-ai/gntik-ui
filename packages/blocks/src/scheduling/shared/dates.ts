/** Native-Date helpers for the scheduling blocks. Weeks start on Monday. */

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar key "YYYY-MM-DD". */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Monday of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  return addDays(startOfDay(d), -((d.getDay() + 6) % 7));
}

export function weekDays(d: Date): Date[] {
  const mon = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

/** Six Monday-first weeks covering the month of `d`. */
export function monthGrid(d: Date): Date[][] {
  const start = startOfWeek(startOfMonth(d));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}

/** Decimal hour of the day: 10:30 → 10.5. */
export function hourOf(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}

const cache = new Map<string, Intl.DateTimeFormat>();
/** Cached Intl formatter; `locale` defaults to en-US (pass `useI18n().locale` to localise). */
const fmt = (locale: string | undefined, opts: Intl.DateTimeFormatOptions) => {
  const key = `${locale ?? 'en-US'}|${JSON.stringify(opts)}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale ?? 'en-US', opts);
    cache.set(key, f);
  }
  return f;
};

/** "09:30". */
export const formatTime = (d: Date, locale?: string) => fmt(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
/** "09:30–10:00". */
export const formatRange = (start: Date, end: Date, locale?: string) => `${formatTime(start, locale)}–${formatTime(end, locale)}`;
/** "Wednesday, April 15, 2026". */
export const formatFullDate = (d: Date, locale?: string) => fmt(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);
/** "Wednesday, April 15". */
export const formatDay = (d: Date, locale?: string) => fmt(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(d);
/** "April 2026". */
export const formatMonth = (d: Date, locale?: string) => fmt(locale, { month: 'long', year: 'numeric' }).format(d);
/** "Apr 15". */
export const formatShort = (d: Date, locale?: string) => fmt(locale, { month: 'short', day: 'numeric' }).format(d);
/** "Wed". */
export const formatWeekday = (d: Date, locale?: string, weekday: 'short' | 'long' = 'short') => fmt(locale, { weekday }).format(d);

/** "Apr 13 – 19, 2026" (or across months / years). */
export function formatWeekRange(days: readonly Date[], locale?: string): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (locale && !locale.toLowerCase().startsWith('en')) return fmt(locale, { month: 'short', day: 'numeric', year: 'numeric' }).formatRange(first, last);
  if (sameMonth(first, last)) return `${formatShort(first)} – ${last.getDate()}, ${last.getFullYear()}`;
  if (first.getFullYear() === last.getFullYear()) return `${formatShort(first)} – ${formatShort(last)}, ${last.getFullYear()}`;
  return `${formatShort(first)}, ${first.getFullYear()} – ${formatShort(last)}, ${last.getFullYear()}`;
}
