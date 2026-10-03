export type DateInput = Date | string | number;

/** Epoch ms of a Date, ISO string or epoch number; `undefined` when it cannot be parsed. */
export function toMs(value: DateInput | undefined): number | undefined {
  if (value === undefined) return undefined;
  const ms = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : undefined;
}

export interface DurationUnits {
  h: string;
  m: string;
  s: string;
}

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "1:02:05" or "2:14" (minutes and seconds only under an hour). */
export function formatClock(ms: number) {
  const { h, m, s } = parts(ms);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** "1h 2m", "2m 14s" or "14s": the two most significant units. */
export function formatCompact(ms: number, units: DurationUnits = { h: 'h', m: 'm', s: 's' }) {
  const { h, m, s } = parts(ms);
  if (h > 0) return `${h}${units.h} ${m}${units.m}`;
  if (m > 0) return `${m}${units.m} ${s}${units.s}`;
  return `${s}${units.s}`;
}

/** ISO 8601 duration for `<time dateTime>`, e.g. "PT2M14S". */
export function toIsoDuration(ms: number) {
  const { h, m, s } = parts(ms);
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}
