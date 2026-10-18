import { describe, expect, it } from 'vitest';
import {
  endOfPeriod,
  endOfQuarter,
  endOfYear,
  formatPeriodValue,
  isoWeek,
  quarterOf,
  startOfPeriod,
  startOfQuarter,
  startOfYear,
} from './calendar-utils';

describe('whole-period date helpers', () => {
  it.each([
    [new Date(2025, 11, 29), 2026, 1, '2026-W01', new Date(2025, 11, 29)],
    [new Date(2026, 0, 1), 2026, 1, '2026-W01', new Date(2025, 11, 29)],
    [new Date(2026, 8, 30), 2026, 40, '2026-W40', new Date(2026, 8, 28)],
    [new Date(2026, 11, 31), 2026, 53, '2026-W53', new Date(2026, 11, 28)],
    [new Date(2027, 0, 1), 2026, 53, '2026-W53', new Date(2026, 11, 28)],
  ])('uses ISO week-years for %s', (date, year, week, form, start) => {
    expect(isoWeek(date)).toEqual({ year, week });
    expect(formatPeriodValue(date, 'week')).toBe(form);
    expect(startOfPeriod(date, 'week')).toEqual(start);
  });

  it.each([
    [0, 1, new Date(2026, 0, 1), new Date(2026, 2, 31)],
    [4, 2, new Date(2026, 3, 1), new Date(2026, 5, 30)],
    [8, 3, new Date(2026, 6, 1), new Date(2026, 8, 30)],
    [11, 4, new Date(2026, 9, 1), new Date(2026, 11, 31)],
  ])('returns whole quarter boundaries for month %i', (month, quarter, start, end) => {
    const date = new Date(2026, month, 17, 14, 30);
    expect(quarterOf(date)).toBe(quarter);
    expect(startOfQuarter(date)).toEqual(start);
    expect(endOfQuarter(date)).toEqual(end);
    expect(startOfPeriod(date, 'quarter')).toEqual(start);
    expect(endOfPeriod(date, 'quarter')).toEqual(end);
  });

  it('formats stable month, quarter and year form values and local boundaries', () => {
    const date = new Date(2026, 2, 17, 12);
    expect(formatPeriodValue(date, 'month')).toBe('2026-03');
    expect(formatPeriodValue(new Date(2026, 6, 17), 'quarter')).toBe('2026-Q3');
    expect(formatPeriodValue(date, 'year')).toBe('2026');
    expect(startOfPeriod(date, 'month')).toEqual(new Date(2026, 2, 1));
    expect(endOfPeriod(date, 'month')).toEqual(new Date(2026, 2, 31));
    expect(startOfYear(date)).toEqual(new Date(2026, 0, 1));
    expect(endOfYear(date)).toEqual(new Date(2026, 11, 31));
    expect(startOfPeriod(date, 'year')).toEqual(new Date(2026, 0, 1));
    expect(endOfPeriod(date, 'year')).toEqual(new Date(2026, 11, 31));
    expect(endOfPeriod(new Date(2026, 8, 30), 'week')).toEqual(new Date(2026, 9, 4));
  });
});
