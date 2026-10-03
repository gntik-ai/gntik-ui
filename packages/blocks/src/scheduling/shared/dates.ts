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

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', opts);
const timeFmt = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fullFmt = fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const dayFmt = fmt({ weekday: 'long', month: 'long', day: 'numeric' });
const monthFmt = fmt({ month: 'long', year: 'numeric' });
const shortFmt = fmt({ month: 'short', day: 'numeric' });
const weekdayFmt = fmt({ weekday: 'short' });

/** "09:30". */
export const formatTime = (d: Date) => timeFmt.format(d);
/** "09:30–10:00". */
export const formatRange = (start: Date, end: Date) => `${formatTime(start)}–${formatTime(end)}`;
/** "Wednesday, April 15, 2026". */
export const formatFullDate = (d: Date) => fullFmt.format(d);
/** "Wednesday, April 15". */
export const formatDay = (d: Date) => dayFmt.format(d);
/** "April 2026". */
export const formatMonth = (d: Date) => monthFmt.format(d);
/** "Apr 15". */
export const formatShort = (d: Date) => shortFmt.format(d);
/** "Wed". */
export const formatWeekday = (d: Date) => weekdayFmt.format(d);

/** "Apr 13 – 19, 2026" (or across months / years). */
export function formatWeekRange(days: readonly Date[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (sameMonth(first, last)) return `${formatShort(first)} – ${last.getDate()}, ${last.getFullYear()}`;
  if (first.getFullYear() === last.getFullYear()) return `${formatShort(first)} – ${formatShort(last)}, ${last.getFullYear()}`;
  return `${formatShort(first)}, ${first.getFullYear()} – ${formatShort(last)}, ${last.getFullYear()}`;
}
