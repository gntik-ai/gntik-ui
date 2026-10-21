/** Native-Date helpers for the scheduling blocks. Week starts are caller-supplied. */
import type { WeekDay } from '@gntik-ai/ui';

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

/** First day of the week containing `d`. */
export function startOfWeek(d: Date, weekStartsOn: WeekDay): Date {
  return addDays(startOfDay(d), -((d.getDay() - weekStartsOn + 7) % 7));
}

export function weekDays(d: Date, weekStartsOn: WeekDay): Date[] {
  const first = startOfWeek(d, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

/** Six weeks covering the month of `d`, starting on `weekStartsOn`. */
export function monthGrid(d: Date, weekStartsOn: WeekDay): Date[][] {
  const start = startOfWeek(startOfMonth(d), weekStartsOn);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}

/** Decimal hour of the day: 10:30 → 10.5. */
export function hourOf(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}

const cache = new Map<string, Intl.DateTimeFormat>();
/** Cached Intl formatter; an omitted locale uses the runtime locale. */
const fmt = (locale: string | undefined, opts: Intl.DateTimeFormatOptions) => {
  const key = `${locale ?? new Intl.DateTimeFormat().resolvedOptions().locale}|${JSON.stringify(opts)}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, opts);
    cache.set(key, f);
  }
  return f;
};

/** The clock options accepted by the scheduling blocks. */
export type HourCycle = 'h12' | 'h23';

/** "9:30 AM" or "09:30". */
export const formatTime = (d: Date, locale: string | undefined, hourCycle: HourCycle) =>
  fmt(locale, { hour: hourCycle === 'h12' ? 'numeric' : '2-digit', minute: '2-digit', hourCycle }).format(d);
/** "9:30 AM–10:00 AM" or "09:30–10:00". */
export const formatRange = (start: Date, end: Date, locale: string | undefined, hourCycle: HourCycle) =>
  `${formatTime(start, locale, hourCycle)}–${formatTime(end, locale, hourCycle)}`;
/** Compact gutter label: "9 AM" or "09:00". */
export const formatHour = (hour: number, locale: string | undefined, hourCycle: HourCycle) =>
  fmt(locale, {
    hour: hourCycle === 'h12' ? 'numeric' : '2-digit',
    ...(hourCycle === 'h23' ? { minute: '2-digit' as const } : {}),
    hourCycle,
  }).format(new Date(2026, 0, 1, hour));
/** "Wednesday, April 15, 2026". */
export const formatFullDate = (d: Date, locale?: string) =>
  fmt(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);
/** "Wednesday, April 15". */
export const formatDay = (d: Date, locale?: string) =>
  fmt(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(d);
/** "April 2026". */
export const formatMonth = (d: Date, locale?: string) => fmt(locale, { month: 'long', year: 'numeric' }).format(d);
/** "Apr 15". */
export const formatShort = (d: Date, locale?: string) => fmt(locale, { month: 'short', day: 'numeric' }).format(d);
/** "Wed". */
export const formatWeekday = (d: Date, locale?: string, weekday: 'short' | 'long' = 'short') =>
  fmt(locale, { weekday }).format(d);

/** "Apr 13 – 19, 2026" (or across months / years). */
export function formatWeekRange(days: readonly Date[], locale?: string): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (locale && !locale.toLowerCase().startsWith('en'))
    return fmt(locale, { month: 'short', day: 'numeric', year: 'numeric' }).formatRange(first, last);
  if (sameMonth(first, last)) return `${formatShort(first, 'en-US')} – ${last.getDate()}, ${last.getFullYear()}`;
  if (first.getFullYear() === last.getFullYear())
    return `${formatShort(first, 'en-US')} – ${formatShort(last, 'en-US')}, ${last.getFullYear()}`;
  return `${formatShort(first, 'en-US')}, ${first.getFullYear()} – ${formatShort(last, 'en-US')}, ${last.getFullYear()}`;
}

/** Internal to blocks: Intl weekdays 1–7 become JS weekdays 0–6. */
export function weekendDays(locale?: string): WeekDay[] {
  try {
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: () => { weekend: number[] };
      weekInfo?: { weekend: number[] };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return info.weekend.map((day) => (day % 7) as WeekDay);
  } catch {}
  return [6, 0];
}
