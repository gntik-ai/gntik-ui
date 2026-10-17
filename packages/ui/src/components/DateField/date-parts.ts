import { toISODate } from '../Calendar/calendar-utils';
import { formatTimeOfDay } from '../TimePicker/time-utils';

export type DateKey = 'year' | 'month' | 'day';
export type SegmentKey = DateKey | 'hour' | 'minute' | 'second' | 'period';
export type Granularity = 'day' | 'hour' | 'minute' | 'second';
export type DatePart = { key: SegmentKey } | { literal: string };

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
export const toDateDraft = (value: Date | null): DateDraft =>
  value && Number.isFinite(value.getTime())
    ? {
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
        hour: value.getHours(),
        minute: value.getMinutes(),
        second: value.getSeconds(),
        pm: value.getHours() >= 12,
        edited: {},
      }
    : emptyDate();

export function dateComplete(draft: DateDraft, granularity: Granularity = 'day'): boolean {
  return (
    draft.year !== null &&
    draft.month !== null &&
    draft.day !== null &&
    (granularity === 'day' ||
      (draft.hour !== null &&
        (granularity === 'hour' || (draft.minute !== null && (granularity === 'minute' || draft.second !== null)))))
  );
}

/** Build locally and compare the calendar parts so Date's rollover cannot accept 31 February. */
export function draftDate(draft: DateDraft, granularity: Granularity = 'day'): Date | null {
  const { year, month, day } = draft;
  if (!dateComplete(draft, granularity) || year === null || month === null || day === null) return null;
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
  if (key === 'period')
    return draft.hour !== null ? Number(draft.hour >= 12) : draft.pm === null ? null : Number(draft.pm);
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
  const pm = draft.hour !== null ? draft.hour >= 12 : draft.pm;
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
  return draft.year && draft.year <= 9999 && draft.month && draft.month <= 12 && draft.day && draft.day <= 31
    ? draft
    : null;
}

export function formatFormDate(date: Date | null, granularity: Granularity): string {
  if (!date) return '';
  const day = toISODate(date).replace(/^\d+-/, `${String(date.getFullYear()).padStart(4, '0')}-`);
  if (granularity === 'day') return day;
  return `${day}T${formatTimeOfDay({ hours: date.getHours(), minutes: granularity === 'hour' ? 0 : date.getMinutes(), seconds: date.getSeconds() }, granularity === 'second')}`;
}
