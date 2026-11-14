import { compareDay } from '../Calendar/calendar-utils';
import { fromZonedParts, isValidTimeZone, zonedParts } from '../../i18n/time-zone';
import { formatTimeOfDay } from '../TimePicker/time-utils';

export type DateKey = 'year' | 'month' | 'day';
export type SegmentKey = DateKey | 'hour' | 'minute' | 'second' | 'period';
export type Granularity = 'day' | 'hour' | 'minute' | 'second';
export type DatePart = { key: SegmentKey } | { literal: string };

/** The wall clock a field reads and writes: an IANA zone, or `system` for the runtime's local clock. */
export function fieldZone(timeZone?: string, utc?: boolean): string {
  if (utc) return 'UTC';
  return timeZone && isValidTimeZone(timeZone) ? timeZone : 'system';
}

/** Local-midnight proxy of the calendar day an instant has in `zone`; the year survives years 0-99. */
export function calendarDay(date: Date, zone = 'system'): Date {
  const parts = zonedParts(date, zone);
  const day = new Date(0);
  day.setHours(0, 0, 0, 0);
  day.setFullYear(parts.year, parts.month - 1, parts.day);
  return day;
}

/** Day fields ignore time; date-time fields retain timestamp constraints. */
export function compareFieldDates(a: Date, b: Date, granularity: Granularity, zone = 'system'): number {
  if (granularity !== 'day') return a.getTime() - b.getTime();
  const [x, y] = zone === 'system' ? [a, b] : [calendarDay(a, zone), calendarDay(b, zone)];
  // compareDay's Date constructor remaps years below 100; compare years before days.
  return x.getFullYear() - y.getFullYear() || compareDay(x, y);
}

/** Numeric order and separators; unsupported locales fall back to ISO order. */
export function dateParts(locale?: string): DatePart[] {
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(2026, 9, 1))
      .flatMap<DatePart>((part) =>
        part.type === 'year' || part.type === 'month' || part.type === 'day'
          ? [{ key: part.type }]
          : part.type === 'literal'
            ? [{ literal: part.value }]
            : [],
      );
  } catch {
    return [{ key: 'year' }, { literal: '-' }, { key: 'month' }, { literal: '-' }, { key: 'day' }];
  }
}

export function fieldParts(locale: string | undefined, granularity: Granularity, hourCycle: 12 | 24): DatePart[] {
  const parts = dateParts(locale);
  if (granularity !== 'day') parts.push({ literal: ' ' }, { key: 'hour' });
  if (granularity === 'minute' || granularity === 'second') parts.push({ literal: ':' }, { key: 'minute' });
  if (granularity === 'second') parts.push({ literal: ':' }, { key: 'second' });
  if (granularity !== 'day' && hourCycle === 12) parts.push({ literal: ' ' }, { key: 'period' });
  return parts;
}

export interface DateDraft {
  year: number | null;
  month: number | null;
  day: number | null;
  /** 24-hour clock; the period may be selected before the hour. */
  hour: number | null;
  minute: number | null;
  second: number | null;
  pm: boolean | null;
  edited: Partial<Record<SegmentKey, boolean>>;
}
export const emptyDate = (): DateDraft => ({
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  second: null,
  pm: null,
  edited: {},
});
export function toDateDraft(value: Date | null, zone = 'system'): DateDraft {
  if (!value || !Number.isFinite(value.getTime())) return emptyDate();
  const p = zonedParts(value, zone);
  return {
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    second: p.second,
    pm: p.hour >= 12,
    edited: {},
  };
}

/**
 * Every segment of the granularity is filled. With `hourCycle` 12 a date-time also needs an explicit period: an
 * AM/PM inferred from the hour is not one, so a typed date-time waits until the user enters it.
 */
export function dateComplete(draft: DateDraft, granularity: Granularity = 'day', hourCycle: 12 | 24 = 24): boolean {
  return (
    draft.year !== null &&
    draft.month !== null &&
    draft.day !== null &&
    (granularity === 'day' ||
      (draft.hour !== null &&
        (hourCycle === 24 || draft.pm !== null) &&
        (granularity === 'hour' || (draft.minute !== null && (granularity === 'minute' || draft.second !== null)))))
  );
}

/** How many segments of the granularity are filled: none, some, or all of them. */
export function draftFill(
  draft: DateDraft,
  granularity: Granularity,
  hourCycle: 12 | 24,
): 'empty' | 'partial' | 'complete' {
  const keys: SegmentKey[] = ['year', 'month', 'day'];
  if (granularity !== 'day') keys.push('hour');
  if (granularity === 'minute' || granularity === 'second') keys.push('minute');
  if (granularity === 'second') keys.push('second');
  if (granularity !== 'day' && hourCycle === 12) keys.push('period');
  const filled = keys.filter((key) => (key === 'period' ? draft.pm !== null : draft[key] !== null));
  return filled.length === 0 ? 'empty' : filled.length === keys.length ? 'complete' : 'partial';
}

/**
 * Build the instant of a complete draft, rejecting impossible calendar days such as 31 February. A non-system zone
 * resolves the wall time through the zone rules, never through the host's local clock.
 */
export function draftDate(
  draft: DateDraft,
  granularity: Granularity = 'day',
  hourCycle: 12 | 24 = 24,
  zone = 'system',
): Date | null {
  const { year, month, day } = draft;
  if (!dateComplete(draft, granularity, hourCycle) || year === null || month === null || day === null) return null;
  if (zone !== 'system') {
    if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
    return fromZonedParts(
      {
        year,
        month,
        day,
        hour: granularity === 'day' ? 0 : (draft.hour ?? 0),
        minute: granularity === 'day' || granularity === 'hour' ? 0 : (draft.minute ?? 0),
        second: granularity === 'second' ? (draft.second ?? 0) : 0,
      },
      zone,
      'compatible',
    );
  }
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  date.setHours(
    granularity === 'day' ? 0 : (draft.hour ?? 0),
    granularity === 'day' || granularity === 'hour' ? 0 : (draft.minute ?? 0),
    granularity === 'second' ? (draft.second ?? 0) : 0,
  );
  return year >= 1 &&
    year <= 9999 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

export function daysInMonth(year: number | null, month: number | null): number {
  if (year === null || month === null) return 31;
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function displaySegment(draft: DateDraft, key: SegmentKey, hourCycle: 12 | 24): number | null {
  if (key === 'period') return draft.pm === null ? null : Number(draft.pm);
  if (key === 'hour' && hourCycle === 12) return draft.hour === null ? null : draft.hour % 12 || 12;
  return draft[key];
}

export function segmentRange(key: SegmentKey, draft: DateDraft, hourCycle: 12 | 24): [number, number] {
  if (key === 'year') return [1, 9999];
  if (key === 'month') return [1, 12];
  if (key === 'day') return [1, daysInMonth(draft.year, draft.month)];
  if (key === 'hour') return hourCycle === 12 ? [1, 12] : [0, 23];
  return [0, key === 'period' ? 1 : 59];
}

export function withDateSegment(draft: DateDraft, key: SegmentKey, n: number | null, hourCycle: 12 | 24): DateDraft {
  const next = { ...draft, edited: { ...draft.edited, [key]: true } };
  // Only an entered or supplied period counts; an hour typed first leaves it unset.
  const pm = draft.pm;
  if (key === 'period') {
    next.pm = n === null ? null : n === 1;
    // Clearing a required period makes the date-time incomplete too.
    next.hour = n === null ? null : draft.hour === null ? null : (draft.hour % 12) + (n ? 12 : 0);
  } else if (key === 'hour') {
    next.hour = n === null ? null : hourCycle === 24 ? n : (n % 12) + (pm ? 12 : 0);
    next.pm = pm;
  } else next[key] = n;
  return next;
}

/** Strict numeric syntax only; impossible calendar days remain drafts for validation. */
export function parseDatePaste(text: string, locale?: string): DateDraft | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?)?$/.exec(text.trim());
  let draft = emptyDate();
  if (iso)
    draft = {
      ...draft,
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
      hour: Number(iso[4] ?? 0),
      minute: Number(iso[5] ?? 0),
      second: Number(iso[6] ?? 0),
    };
  else {
    const numeric = /^(\d{1,4})[/.-](\d{1,4})[/.-](\d{1,4})$/.exec(text.trim());
    if (!numeric) return null;
    const keys = dateParts(locale).flatMap((part) => ('key' in part ? [part.key] : []));
    keys.forEach((key, i) => {
      if (key === 'year' || key === 'month' || key === 'day') draft[key] = Number(numeric[i + 1]);
    });
    draft.hour = draft.minute = draft.second = 0;
  }
  // A pasted value names its period (midnight by default), so a 12-hour field never waits for one.
  draft.pm = (draft.hour ?? 0) >= 12;
  return draft.year && draft.year <= 9999 && draft.month && draft.month <= 12 && draft.day && draft.day <= 31
    ? draft
    : null;
}

export function formatFormDate(date: Date | null, granularity: Granularity, zone = 'system'): string {
  if (!date) return '';
  const p = zonedParts(date, zone);
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${String(p.year).padStart(4, '0')}-${pad(p.month)}-${pad(p.day)}`;
  if (granularity === 'day') return day;
  return `${day}T${formatTimeOfDay({ hours: p.hour, minutes: granularity === 'hour' ? 0 : p.minute, seconds: p.second }, granularity === 'second')}`;
}
