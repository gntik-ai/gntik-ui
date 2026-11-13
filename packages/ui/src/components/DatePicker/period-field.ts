import {
  endOfPeriod,
  formatDate,
  formatDateRange,
  normalizeRange,
  quarterOf,
  startOfPeriod,
  type DateRange,
  type PeriodGranularity,
  type WeekDay,
} from '../Calendar/calendar-utils';
import type { I18nFormatters } from '../../i18n/format';
import { periodUnavailable } from '../PeriodPicker/period-utils';

/** `granularity` of DatePicker and DateRangePicker: `day` is the day calendar, the rest pick whole periods. */
export type DatePickerGranularity = 'day' | PeriodGranularity;

/** Initial focus in the period grid: its tabbable cell. */
export function focusPeriodCell(container: HTMLElement | null) {
  return container?.querySelector<HTMLElement>('button[data-period][tabindex="0"]') ?? true;
}

const FIELD_OPTIONS: Record<PeriodGranularity, Intl.DateTimeFormatOptions> = {
  week: { month: 'short', day: 'numeric', year: 'numeric' },
  month: { month: 'short', year: 'numeric' },
  quarter: { month: 'short', year: 'numeric' },
  year: { year: 'numeric' },
};

/** Whole periods covered by a range, whatever the order or the day picked inside each period. */
export function snapPeriodRange(range: DateRange, granularity: PeriodGranularity, weekStartsOn: WeekDay): DateRange {
  if (!range.start) return range;
  const ordered = range.end ? normalizeRange(range.start, range.end) : range;
  return {
    start: startOfPeriod(ordered.start!, granularity, weekStartsOn),
    end: ordered.end ? endOfPeriod(ordered.end, granularity, weekStartsOn) : null,
  };
}

/**
 * Field text of a whole-period value: months and years through Intl, weeks as a day range and quarters from the
 * catalog (`Q2 2026`). `formatOptions` replaces all of them with a plain Intl format of the period's days.
 */
export function periodFieldText(
  range: DateRange,
  granularity: PeriodGranularity,
  locale: string | undefined,
  t: I18nFormatters['t'],
  weekStartsOn: WeekDay,
  formatOptions?: Intl.DateTimeFormatOptions,
): string {
  const { start, end } = snapPeriodRange(range, granularity, weekStartsOn);
  if (!start) return '';
  if (granularity === 'quarter' && !formatOptions) {
    const label = (d: Date) => t('datePicker.quarter', { quarter: quarterOf(d), year: d.getFullYear() });
    const first = label(start);
    const last = end ? label(end) : first;
    return first === last ? first : `${first} – ${last}`;
  }
  const options = formatOptions ?? FIELD_OPTIONS[granularity];
  // A single week reads as its days; other single periods read as their first day.
  const last = end ?? (granularity === 'week' && !formatOptions ? endOfPeriod(start, 'week', weekStartsOn) : null);
  return last ? formatDateRange({ start, end: last }, locale, options) : formatDate(start, locale, options);
}

/** A preset range is unavailable when its first or last period lies outside `min` and `max`, as the grid shows it. */
export function periodRangeUnavailable(
  range: DateRange,
  granularity: PeriodGranularity,
  weekStartsOn: WeekDay,
  bounds: { min?: Date; max?: Date },
): boolean {
  const { start, end } = snapPeriodRange(range, granularity, weekStartsOn);
  if (!start) return false;
  return [start, end ?? start].some((day) => periodUnavailable(day, granularity, bounds, weekStartsOn));
}
