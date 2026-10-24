/** Native-Date helpers for scheduling. All optional zones default to the runtime clock. */
import { fromZonedParts, zonedParts, type WeekDay } from '@gntik-ai/ui';

const pad = (n: number) => String(n).padStart(2, '0');

/** Midnight in the display zone, normalizing calendar arithmetic before DST conversion. */
function calendarDate(year: number, month: number, day: number, zone = 'system'): Date {
  if (zone === 'system') return new Date(year, month - 1, day);
  const normalized = new Date(0);
  normalized.setUTCFullYear(year, month - 1, day);
  const parts = zonedParts(normalized, 'UTC');
  return fromZonedParts(parts, zone)!;
}

export function dayKey(d: Date, zone = 'system'): string {
  const p = zonedParts(d, zone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}
export function startOfDay(d: Date, zone = 'system'): Date {
  const p = zonedParts(d, zone);
  return calendarDate(p.year, p.month, p.day, zone);
}
export function addDays(d: Date, n: number, zone = 'system'): Date {
  const p = zonedParts(d, zone);
  return calendarDate(p.year, p.month, p.day + n, zone);
}
export function addMonths(d: Date, n: number, zone = 'system'): Date {
  const p = zonedParts(d, zone);
  return calendarDate(p.year, p.month + n, 1, zone);
}
export function startOfMonth(d: Date, zone = 'system'): Date {
  return addMonths(d, 0, zone);
}
export function sameDay(a: Date, b: Date, zone = 'system'): boolean {
  return dayKey(a, zone) === dayKey(b, zone);
}
export function sameMonth(a: Date, b: Date, zone = 'system'): boolean {
  const p = zonedParts(a, zone),
    q = zonedParts(b, zone);
  return p.year === q.year && p.month === q.month;
}
export function weekday(d: Date, zone = 'system'): WeekDay {
  const p = zonedParts(d, zone);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() as WeekDay;
}
export function startOfWeek(d: Date, weekStartsOn: WeekDay, zone = 'system'): Date {
  return addDays(d, -((weekday(d, zone) - weekStartsOn + 7) % 7), zone);
}
export function weekDays(d: Date, weekStartsOn: WeekDay, zone = 'system'): Date[] {
  const first = startOfWeek(d, weekStartsOn, zone);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i, zone));
}
export function monthGrid(d: Date, weekStartsOn: WeekDay, zone = 'system'): Date[][] {
  const start = startOfWeek(startOfMonth(d, zone), weekStartsOn, zone);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i, zone)));
}
export function hourOf(d: Date, zone = 'system'): number {
  const p = zonedParts(d, zone);
  return p.hour + p.minute / 60;
}

const cache = new Map<string, Intl.DateTimeFormat>();
const runtimeLocales = new WeakMap<typeof Intl.DateTimeFormat, string>();
function runtimeLocale(): string {
  let locale = runtimeLocales.get(Intl.DateTimeFormat);
  if (!locale) {
    locale = new Intl.DateTimeFormat().resolvedOptions().locale;
    runtimeLocales.set(Intl.DateTimeFormat, locale);
  }
  return locale;
}
/** Cached Intl formatter; an omitted locale uses the runtime locale. */
const fmt = (locale: string | undefined, opts: Intl.DateTimeFormatOptions) => {
  const key = `${locale ?? runtimeLocale()}|${JSON.stringify(opts)}`;
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
export const formatTime = (d: Date, locale: string | undefined, hourCycle: HourCycle, zone = 'system') =>
  fmt(locale, {
    timeZone: zone === 'system' ? undefined : zone,
    hour: hourCycle === 'h12' ? 'numeric' : '2-digit',
    minute: '2-digit',
    hourCycle,
  }).format(d);
/** "9:30 AM–10:00 AM" or "09:30–10:00". */
export const formatRange = (
  start: Date,
  end: Date,
  locale: string | undefined,
  hourCycle: HourCycle,
  zone = 'system',
) => `${formatTime(start, locale, hourCycle, zone)}–${formatTime(end, locale, hourCycle, zone)}`;
/** Compact gutter label: "9 AM" or "09:00". */
export const formatHour = (hour: number, locale: string | undefined, hourCycle: HourCycle) =>
  fmt(locale, {
    hour: hourCycle === 'h12' ? 'numeric' : '2-digit',
    ...(hourCycle === 'h23' ? { minute: '2-digit' as const } : {}),
    hourCycle,
  }).format(new Date(2026, 0, 1, hour));
/** "Wednesday, April 15, 2026". */
export const formatFullDate = (d: Date, locale?: string, zone = 'system') =>
  fmt(locale, {
    timeZone: zone === 'system' ? undefined : zone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
/** "Wednesday, April 15". */
export const formatDay = (d: Date, locale?: string, zone = 'system') =>
  fmt(locale, {
    timeZone: zone === 'system' ? undefined : zone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(d);
/** "April 2026". */
export const formatMonth = (d: Date, locale?: string, zone = 'system') =>
  fmt(locale, { timeZone: zone === 'system' ? undefined : zone, month: 'long', year: 'numeric' }).format(d);
/** "Apr 15". */
export const formatShort = (d: Date, locale?: string, zone = 'system') =>
  fmt(locale, { timeZone: zone === 'system' ? undefined : zone, month: 'short', day: 'numeric' }).format(d);
/** "Wed". */
export const formatWeekday = (d: Date, locale?: string, weekday: 'short' | 'long' = 'short', zone = 'system') =>
  fmt(locale, { timeZone: zone === 'system' ? undefined : zone, weekday }).format(d);

/** "Apr 13 – 19, 2026" (or across months / years). */
export function formatWeekRange(days: readonly Date[], locale?: string, zone = 'system'): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (locale && !locale.toLowerCase().startsWith('en'))
    return fmt(locale, {
      timeZone: zone === 'system' ? undefined : zone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).formatRange(first, last);
  if (sameMonth(first, last, zone))
    return `${formatShort(first, 'en-US', zone)} – ${zonedParts(last, zone).day}, ${zonedParts(last, zone).year}`;
  if (zonedParts(first, zone).year === zonedParts(last, zone).year)
    return `${formatShort(first, 'en-US', zone)} – ${formatShort(last, 'en-US', zone)}, ${zonedParts(last, zone).year}`;
  return `${formatShort(first, 'en-US', zone)}, ${zonedParts(first, zone).year} – ${formatShort(last, 'en-US', zone)}, ${zonedParts(last, zone).year}`;
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
