import { describeCron, nextRuns, parseCron } from './cron';
import { compressCronList, cronFromSchedule, scheduleFromCron } from './schedule-presets';

describe('parseCron', () => {
  it('expands *, lists, ranges, steps, names and 7 = Sunday', () => {
    const r = parseCron('*/15 9-17/4 1,15 JAN-MAR mon,fri,7');
    expect(r.valid).toBe(true);
    if (!r.valid) return;
    expect(r.cron.minute.values).toEqual([0, 15, 30, 45]);
    expect(r.cron.minute.step).toBe(15);
    expect(r.cron.hour.values).toEqual([9, 13, 17]);
    expect(r.cron.dayOfMonth.values).toEqual([1, 15]);
    expect(r.cron.month.values).toEqual([1, 2, 3]);
    expect(r.cron.dayOfWeek.values).toEqual([0, 1, 5]);
    expect(parseCron('10/20 * * * *').cron?.minute.values).toEqual([10, 30, 50]);
  });

  it('expands macros', () => {
    expect(parseCron('@daily').cron?.expression).toBe('0 0 * * *');
    expect(parseCron('@weekly').cron?.expression).toBe('0 0 * * 0');
  });

  it.each([
    ['', 'empty', 'Enter a cron expression.'],
    ['* * * *', 'fieldCount', 'Expected 5 fields (minute hour day month weekday), found 4.'],
    ['60 * * * *', 'range', 'minute value “60” is outside 0–59.'],
    ['* 5-2 * * *', 'invalid', 'Invalid hour value “5-2”.'],
    ['*/0 * * * *', 'step', 'Invalid step “*/0” in minute.'],
    ['* * * foo *', 'invalid', 'Invalid month value “foo”.'],
    ['@reboot', 'macro', 'Unsupported macro “@reboot”.'],
  ])('%j is invalid (%s)', (expr, code, message) => {
    const r = parseCron(expr);
    expect(r.valid).toBe(false);
    expect(r.error?.code).toBe(code);
    expect(r.error?.message).toBe(message);
  });
});

describe('describeCron', () => {
  it.each([
    ['* * * * *', 'Every minute'],
    ['*/5 * * * *', 'Every 5 minutes'],
    ['0 * * * *', 'Every hour'],
    ['15,45 * * * *', 'Every hour at minutes 15 and 45'],
    ['0 */2 * * *', 'Every 2 hours'],
    ['30 9 * * *', 'Every day at 09:30'],
    ['0 9 * * 1-5', 'Every weekday at 09:00'],
    ['0 9,17 * * 1-5', 'Every weekday at 09:00 and 17:00'],
    ['0 8 * * 1,5', 'Every Monday and Friday at 08:00'],
    ['0 0 1 * *', 'Monthly on day 1 at 00:00'],
    ['*/15 9-17 * * 1-5', 'Every 15 minutes, between 09:00 and 17:59, on weekdays'],
    ['0 0 1 1 *', 'Monthly on day 1 at 00:00, in January'],
    ['0 12 13 * 5', 'At 12:00, on day 13 of the month or on Friday'],
    ['bad', ''],
  ])('%s → %s', (expr, text) => {
    expect(describeCron(expr)).toBe(text);
  });

  it('uses the built-in catalog of the locale', () => {
    expect(describeCron('0 9 * * 1-5', { locale: 'es' })).toBe('De lunes a viernes a las 09:00');
  });
});

describe('nextRuns', () => {
  const from = new Date(Date.UTC(2026, 2, 27, 10, 0)); // Friday 27 March 2026, 10:00 UTC

  it('lists the next runs in a time zone', () => {
    const runs = nextRuns('0 9 * * 1-5', from, 3, 'UTC');
    expect(runs.map((d) => d.toISOString())).toEqual(['2026-03-30T09:00:00.000Z', '2026-03-31T09:00:00.000Z', '2026-04-01T09:00:00.000Z']);
  });

  it('follows the wall clock across a DST change and skips missing times', () => {
    // Europe/Madrid springs forward on 29 March 2026 (02:00 → 03:00, UTC+1 → UTC+2).
    const runs = nextRuns('30 9 * * *', from, 3, 'Europe/Madrid');
    expect(runs.map((d) => d.toISOString())).toEqual(['2026-03-28T08:30:00.000Z', '2026-03-29T07:30:00.000Z', '2026-03-30T07:30:00.000Z']);
    const gap = nextRuns('30 2 * * *', from, 2, 'Europe/Madrid');
    expect(gap.map((d) => d.toISOString())).toEqual(['2026-03-28T01:30:00.000Z', '2026-03-30T00:30:00.000Z']);
  });

  it('matches either day field when both are restricted (Vixie)', () => {
    const runs = nextRuns('0 0 1 * 1', from, 3, 'UTC');
    expect(runs.map((d) => d.toISOString().slice(0, 10))).toEqual(['2026-03-30', '2026-04-01', '2026-04-06']);
  });

  it('is strictly after `from`, empty for invalid or impossible schedules', () => {
    expect(nextRuns('0 10 * * *', from, 1, 'UTC')[0]?.toISOString()).toBe('2026-03-28T10:00:00.000Z');
    expect(nextRuns('nope', from, 3)).toEqual([]);
    expect(nextRuns('0 0 30 2 *', from, 3, 'UTC')).toEqual([]);
    expect(nextRuns('0 0 29 2 *', from, 1, 'UTC')[0]?.toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });
});

describe('schedule presets', () => {
  it('round-trips the presets', () => {
    expect(scheduleFromCron('5 * * * *')).toMatchObject({ frequency: 'hourly', minute: 5 });
    expect(scheduleFromCron('30 9 * * *')).toMatchObject({ frequency: 'daily', hour: 9, minute: 30 });
    expect(scheduleFromCron('0 9 * * 1-5')).toMatchObject({ frequency: 'weekly', weekdays: [1, 2, 3, 4, 5] });
    expect(scheduleFromCron('0 6 15 * *')).toMatchObject({ frequency: 'monthly', dayOfMonth: 15 });
    expect(scheduleFromCron('*/5 * * * *').frequency).toBe('custom');
    expect(cronFromSchedule({ frequency: 'weekly', minute: 0, hour: 8, weekdays: [5, 1, 3], dayOfMonth: 1 })).toBe('0 8 * * 1,3,5');
    expect(compressCronList([0, 1, 2, 3, 6])).toBe('0-3,6');
  });
});
