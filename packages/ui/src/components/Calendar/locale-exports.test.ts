import { localeHourCycle, localeWeekStart } from '@gntik-ai/ui';

it('exports the calendar week start alongside the unchanged numeric hour cycle', () => {
  expect(localeWeekStart('en-US')).toBe(0);
  expect(localeWeekStart('es-ES')).toBe(1);
  expect(localeHourCycle('en-US')).toBe(12);
  expect(localeHourCycle('en-GB')).toBe(24);
});
