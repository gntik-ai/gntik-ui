import type { I18nFormatters } from '../../i18n/format';
import type { MessageKey } from '../../i18n/messages/en';
import {
  addDays,
  addMonths,
  endOfPeriod,
  startOfPeriod,
  type DateRange,
  type PeriodGranularity,
} from '../Calendar/calendar-utils';

export interface PeriodPreset {
  id: string;
  label: string;
  value: (today: Date) => Date | DateRange;
}

const labels: Record<PeriodGranularity, [MessageKey, MessageKey]> = {
  week: ['periodPicker.thisWeek', 'periodPicker.lastWeek'],
  month: ['periodPicker.thisMonth', 'periodPicker.lastMonth'],
  quarter: ['periodPicker.thisQuarter', 'periodPicker.lastQuarter'],
  year: ['periodPicker.thisYear', 'periodPicker.lastYear'],
};

/** This and last complete period, with labels supplied by the current i18n catalog. */
export function getDefaultPeriodPresets(
  granularity: PeriodGranularity,
  mode: 'single' | 'range',
  t: I18nFormatters['t'],
): PeriodPreset[] {
  return [0, -1].map((offset, index) => ({
    id: `${offset === 0 ? 'this' : 'last'}-${granularity}`,
    label: t(labels[granularity][index === 0 ? 0 : 1]),
    value: (today: Date) => {
      const current = startOfPeriod(today, granularity);
      const date =
        granularity === 'week'
          ? addDays(current, offset * 7)
          : addMonths(current, offset * (granularity === 'year' ? 12 : granularity === 'quarter' ? 3 : 1));
      const start = startOfPeriod(date, granularity);
      return mode === 'range' ? { start, end: endOfPeriod(start, granularity) } : start;
    },
  }));
}
