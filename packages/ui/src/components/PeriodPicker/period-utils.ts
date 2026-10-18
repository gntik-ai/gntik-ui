import { useI18n, useOptionalI18n, builtInMessages } from '../../i18n/I18nProvider';
import { createFormatters } from '../../i18n/format';
import type { I18nFormatters } from '../../i18n/format';
import { compareDay, endOfPeriod, isoWeek, quarterOf, type PeriodGranularity } from '../Calendar/calendar-utils';
import type { PeriodCommonProps } from './period-types';

/** An explicit locale selects both Intl formatting and the built-in message catalog. */
export function usePeriodI18n(localeProp?: string) {
  const provider = useI18n();
  const optional = useOptionalI18n();
  const locale = localeProp ?? optional?.locale ?? 'en';
  const t =
    localeProp && localeProp !== optional?.locale ? createFormatters(locale, builtInMessages(locale)).t : provider.t;
  return { locale, t };
}

export function periodLabel(date: Date, granularity: PeriodGranularity, locale: string, t: I18nFormatters['t']) {
  switch (granularity) {
    case 'month':
      return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
    case 'quarter':
      return t('periodPicker.quarter', { quarter: quarterOf(date), year: date.getFullYear() });
    case 'week':
      return t('periodPicker.week', isoWeek(date));
    case 'year':
      return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
  }
}

export function periodUnavailable(start: Date, granularity: PeriodGranularity, props: PeriodCommonProps) {
  return (
    !!props.disabled ||
    (!!props.min && compareDay(endOfPeriod(start, granularity), props.min) < 0) ||
    (!!props.max && compareDay(start, props.max) > 0) ||
    !!props.isPeriodDisabled?.(start)
  );
}
