import {
  formatWeekRange,
  weekendDays,
  dayKey,
  monthGrid,
  startOfWeek,
  weekDays,
  formatTime,
  formatRange,
  formatHour,
} from './dates';
import type { WeekDay } from '@gntik-ai/ui';

it.each<[WeekDay, string]>([
  [0, '2026-03-29'],
  [1, '2026-03-30'],
  [6, '2026-03-28'],
])('starts April weeks on weekday %s', (weekStartsOn, expected) => {
  const april = new Date(2026, 3, 1, 12);
  expect(dayKey(startOfWeek(april, weekStartsOn))).toBe(expected);
  expect(startOfWeek(april, weekStartsOn).getHours()).toBe(0);
  expect(weekDays(april, weekStartsOn)).toHaveLength(7);
  expect(weekDays(april, weekStartsOn)[0]).toEqual(new Date(`${expected}T00:00:00`));
  const grid = monthGrid(april, weekStartsOn);
  expect(grid).toHaveLength(6);
  expect(grid.every((week) => week.length === 7)).toBe(true);
  expect(grid[0]?.[0]).toEqual(new Date(`${expected}T00:00:00`));
});

it.each([
  ['en-US', 'h12', '9:30 AM', '9:30 AM–10:00 AM', '9 AM', '12 PM'],
  ['en-US', 'h23', '09:30', '09:30–10:00', '09:00', '12:00'],
  ['es-ES', 'h23', '09:30', '09:30–10:00', '09:00', '12:00'],
  ['es-ES', 'h12', '9:30 a. m.', '9:30 a. m.–10:00 a. m.', '9 a. m.', '12 p. m.'],
] as const)('formats time and gutter labels in %s with %s', (locale, cycle, time, range, hour, noon) => {
  const start = new Date(2026, 3, 15, 9, 30);
  expect(formatTime(start, locale, cycle)).toBe(time);
  expect(formatRange(start, new Date(2026, 3, 15, 10), locale, cycle)).toBe(range);
  expect(formatHour(9, locale, cycle)).toBe(hour);
  expect(formatHour(12, locale, cycle)).toBe(noon);
});

it('uses locale weekends and falls back to Saturday and Sunday without Intl week info', () => {
  expect(weekendDays('en-US')).toEqual([6, 0]);
  expect(weekendDays('ar-SA')).toEqual([5, 6]);
  const original = Intl.Locale;
  try {
    vi.stubGlobal('Intl', Object.create(Intl, { Locale: { value: class {} } }));
    expect(weekendDays('en-US')).toEqual([6, 0]);
  } finally {
    vi.unstubAllGlobals();
    expect(Intl.Locale).toBe(original);
  }
});

it('keeps English week labels independent of the host locale', () => {
  const NativeFormatter = Intl.DateTimeFormat;
  try {
    vi.stubGlobal(
      'Intl',
      Object.create(Intl, {
        DateTimeFormat: {
          value: class extends NativeFormatter {
            constructor(locale?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
              super(locale ?? 'es-ES', options);
            }
          },
        },
      }),
    );
    expect(formatWeekRange(weekDays(new Date(2026, 3, 15), 1), 'en-GB')).toBe('Apr 13 – 19, 2026');
  } finally {
    vi.unstubAllGlobals();
  }
});
