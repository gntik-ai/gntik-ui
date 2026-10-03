import type { MessageKey } from '../../i18n/messages/en';
import type { MessageVars } from '../../i18n/format';

export type RelativeTimeUnit = 'minute' | 'hour' | 'day';

/** A serialisable time range: relative to "now" ("last 15 minutes") or between two instants. */
export type TimeRangeValue =
  | { mode: 'relative'; amount: number; unit: RelativeTimeUnit }
  | { mode: 'absolute'; start: Date; end: Date };

export interface TimeRangePreset {
  id: string;
  amount: number;
  unit: RelativeTimeUnit;
  /** Defaults to the catalog's "Last …" label. */
  label?: string;
}

/** Last 15 minutes, 1 hour, 24 hours, 7 days, 30 days. */
export const DEFAULT_TIME_RANGE_PRESETS: TimeRangePreset[] = [
  { id: 'last-15m', amount: 15, unit: 'minute' },
  { id: 'last-1h', amount: 1, unit: 'hour' },
  { id: 'last-24h', amount: 24, unit: 'hour' },
  { id: 'last-7d', amount: 7, unit: 'day' },
  { id: 'last-30d', amount: 30, unit: 'day' },
];

const UNIT_MS: Record<RelativeTimeUnit, number> = { minute: 60_000, hour: 3_600_000, day: 86_400_000 };

/** The instants a range covers at `now` (relative ranges end at `now`). */
export function resolveTimeRange(value: TimeRangeValue, now: Date = new Date()): { start: Date; end: Date } {
  if (value.mode === 'absolute') return { start: value.start, end: value.end };
  return { start: new Date(now.getTime() - value.amount * UNIT_MS[value.unit]), end: now };
}

const LAST_KEY: Record<RelativeTimeUnit, MessageKey> = { minute: 'timeRange.lastMinutes', hour: 'timeRange.lastHours', day: 'timeRange.lastDays' };

/** "Last 15 minutes", "Last hour"… in the translator's language. */
export function relativeTimeRangeLabel(amount: number, unit: RelativeTimeUnit, t: (key: MessageKey, vars?: MessageVars) => string) {
  return t(LAST_KEY[unit], { count: amount });
}

/** Validation of an absolute range: null when valid. */
export function timeRangeError(start: Date | null, end: Date | null): 'incomplete' | 'endBeforeStart' | null {
  if (!start || !end) return 'incomplete';
  return end.getTime() <= start.getTime() ? 'endBeforeStart' : null;
}

/** Same range? (relative: same amount and unit; absolute: same instants). */
export function isSameTimeRange(a: TimeRangeValue | null | undefined, b: TimeRangeValue | null | undefined): boolean {
  if (!a || !b || a.mode !== b.mode) return false;
  if (a.mode === 'relative' && b.mode === 'relative') return a.amount === b.amount && a.unit === b.unit;
  if (a.mode === 'absolute' && b.mode === 'absolute') return a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime();
  return false;
}
