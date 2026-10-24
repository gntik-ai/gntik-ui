import { fromZonedParts, zonedParts, formatTimeZoneLabel, isValidTimeZone } from './time-zone';

describe('display time zones', () => {
  it('moves a skipped Madrid wall time forward, or rejects it', () => {
    const parts = { year: 2026, month: 3, day: 29, hour: 2, minute: 30 };
    expect(fromZonedParts(parts, 'Europe/Madrid')?.toISOString()).toBe('2026-03-29T01:30:00.000Z');
    expect(fromZonedParts(parts, 'Europe/Madrid', 'reject')).toBeNull();
  });
  it('chooses the earlier Madrid overlap, or rejects it', () => {
    const parts = { year: 2026, month: 10, day: 25, hour: 2, minute: 30 };
    expect(fromZonedParts(parts, 'Europe/Madrid')?.toISOString()).toBe('2026-10-25T00:30:00.000Z');
    expect(fromZonedParts(parts, 'Europe/Madrid', 'reject')).toBeNull();
  });
  it('round-trips UTC and ordinary zoned times including sub-minute precision', () => {
    const date = new Date('2026-04-15T07:30:12.345Z');
    expect(zonedParts(date, 'Europe/Madrid')).toEqual({
      year: 2026,
      month: 4,
      day: 15,
      hour: 9,
      minute: 30,
      second: 12,
      millisecond: 345,
    });
    for (const zone of ['UTC', 'Europe/Madrid', 'system']) {
      expect(fromZonedParts(zonedParts(date, zone), zone)?.toISOString()).toBe(date.toISOString());
    }
  });
  it('validates zones and labels them using short names or GMT offsets', () => {
    expect(isValidTimeZone('Mars/Base')).toBe(false);
    for (const zone of ['system', 'UTC', 'Europe/Madrid']) expect(isValidTimeZone(zone)).toBe(true);
    const date = new Date('2026-04-15T12:00:00Z');
    expect(formatTimeZoneLabel('UTC', date, 'en-GB')).toBe('UTC');
    expect(formatTimeZoneLabel('America/New_York', date, 'en-US')).toBe('EDT');
    expect(formatTimeZoneLabel('Asia/Kolkata', date, 'en-GB')).toBe('GMT+5:30');
  });
});
