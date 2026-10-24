/** Wall-clock fields. Months are 1–12; values remain Date instants at public boundaries. */
export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  millisecond?: number;
}

const cache = new Map<string, Intl.DateTimeFormat>();
function formatter(locale: string, timeZone: string | undefined, options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify([locale, timeZone, options]);
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { ...options, timeZone });
    cache.set(key, fmt);
  }
  return fmt;
}

/** `system` is a kit sentinel, never an Intl timeZone. */
function intlZone(timeZone: string) {
  return timeZone === 'system' ? undefined : timeZone;
}

export function isValidTimeZone(name: string): boolean {
  if (name === 'system') return true;
  try {
    formatter('en-US', name, {});
    return true;
  } catch {
    return false;
  }
}

/** Read an instant on the wall clock of a zone (default: the runtime's local clock). */
export function zonedParts(date: Date, timeZone = 'system'): Required<ZonedParts> {
  if (timeZone === 'system') {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    };
  }
  const values: Record<string, number> = {};
  for (const part of formatter('en-US-u-ca-iso8601-nu-latn', timeZone, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }
  return {
    year: values.year!,
    month: values.month!,
    day: values.day!,
    hour: values.hour!,
    minute: values.minute!,
    second: values.second!,
    millisecond: date.getUTCMilliseconds(),
  };
}

function wallEpoch(parts: ZonedParts): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second ?? 0, parts.millisecond ?? 0);
  return date.getTime();
}

/**
 * Convert wall time to an instant. Compatible chooses the earlier overlap and moves a gap
 * forward by its duration. Reject returns null for either. Invalid calendar fields return null.
 */
export function fromZonedParts(
  parts: ZonedParts,
  timeZone = 'system',
  disambiguation: 'compatible' | 'reject' = 'compatible',
): Date | null {
  const wall = wallEpoch(parts);
  if (!Number.isFinite(wall)) return null;
  const normalized = zonedParts(new Date(wall), 'UTC');
  if (Object.entries(parts).some(([key, value]) => normalized[key as keyof ZonedParts] !== value)) return null;
  // Sampling both sides of a transition finds both possible offsets, including half-hour DST.
  const offsets = new Set<number>();
  for (const delta of [-36, 0, 36]) {
    const instant = wall + delta * 3_600_000;
    offsets.add(wallEpoch(zonedParts(new Date(instant), timeZone)) - instant);
  }
  const candidates = [...offsets].map((offset) => wall - offset).sort((a, b) => a - b);
  const matches = candidates.filter((ms) => wallEpoch(zonedParts(new Date(ms), timeZone)) === wall);
  if (disambiguation === 'reject' && matches.length !== 1) return null;
  const result = matches[0] ?? candidates[candidates.length - 1];
  return result === undefined ? null : new Date(result);
}

/** Short zone name when ICU has one, otherwise its GMT offset. UTC always reads "UTC". */
export function formatTimeZoneLabel(timeZone: string, date: Date = new Date(), locale = 'en-US'): string {
  if (timeZone === 'UTC') return 'UTC';
  const zone = intlZone(timeZone);
  return (
    formatter(locale, zone, { timeZoneName: 'short' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ??
    formatter(locale, zone, { timeZoneName: 'shortOffset' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ??
    'GMT'
  );
}
