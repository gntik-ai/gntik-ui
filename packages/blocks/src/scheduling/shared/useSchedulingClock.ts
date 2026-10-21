import { localeHourCycle, useOptionalI18n } from '@gntik-ai/ui';
import type { HourCycle } from './dates';

/** Map the existing public numeric clock API to scheduling's Intl options. */
function resolveHourCycle(locale?: string): HourCycle {
  return localeHourCycle(locale) === 12 ? 'h12' : 'h23';
}

/** Undefined outside a provider lets Intl use the runtime locale, as ui Calendar does. */
export function useSchedulingClock(override?: HourCycle) {
  const locale = useOptionalI18n()?.locale;
  return { locale, hourCycle: override ?? resolveHourCycle(locale) };
}
