export type DateInput = Date | string | number;

/** Parses a Date, ISO string or epoch milliseconds; returns null when invalid. */
export function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/** "3 minutes ago", "in 2 days", "now" — via Intl.RelativeTimeFormat. */
export function formatRelative(date: Date, now: number, locale?: string, style: Intl.RelativeTimeFormatStyle = 'long') {
  const seconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style });
  const abs = Math.abs(seconds);
  if (abs < 10) return rtf.format(0, 'second');
  for (const [unit, size] of UNITS) {
    if (abs >= size || unit === 'second') return rtf.format(Math.trunc(seconds / size), unit);
  }
  return rtf.format(seconds, 'second');
}

/** How often a relative label needs refreshing, from its distance to now. */
export function refreshInterval(date: Date, now: number) {
  const abs = Math.abs(date.getTime() - now);
  if (abs < 60_000) return 5_000;
  if (abs < 3_600_000) return 30_000;
  return 300_000;
}
