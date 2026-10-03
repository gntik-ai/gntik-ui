/** A time of day, 24-hour clock. */
export interface TimeOfDay {
  hours: number;
  minutes: number;
  seconds: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `"09:30"` / `"09:30:15"` → parts, or `null` when the string is not a valid 24-hour time. */
export function parseTimeOfDay(value: string | null | undefined): TimeOfDay | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  const seconds = m[3] === undefined ? 0 : Number(m[3]);
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return { hours, minutes, seconds };
}

/** Parts → `"HH:mm"`, or `"HH:mm:ss"` with `withSeconds`. */
export function formatTimeOfDay(parts: TimeOfDay, withSeconds = false): string {
  const base = `${pad(parts.hours)}:${pad(parts.minutes)}`;
  return withSeconds ? `${base}:${pad(parts.seconds)}` : base;
}

/** Seconds since midnight (for comparisons). */
export const timeToSeconds = (t: TimeOfDay) => t.hours * 3600 + t.minutes * 60 + t.seconds;

/** Copies the time of day onto a date (local time). */
export function withTimeOfDay(date: Date, t: TimeOfDay): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.hours, t.minutes, t.seconds);
}

/** The time of day of a date (local time). */
export const timeOfDay = (date: Date): TimeOfDay => ({ hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() });

/** 12 or 24: the clock a locale uses by default (Intl). */
export function localeHourCycle(locale?: string): 12 | 24 {
  try {
    const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
    return cycle === 'h11' || cycle === 'h12' ? 12 : 24;
  } catch {
    return 24;
  }
}

/** The locale's AM / PM labels (Intl `dayPeriod`), falling back to "AM" / "PM". */
export function dayPeriodLabels(locale?: string): [am: string, pm: string] {
  const label = (hour: number, fallback: string) => {
    try {
      const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' }).formatToParts(new Date(2000, 0, 1, hour));
      return parts.find((p) => p.type === 'dayPeriod')?.value ?? fallback;
    } catch {
      return fallback;
    }
  };
  return [label(9, 'AM'), label(21, 'PM')];
}
