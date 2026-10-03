import { parseCron } from './cron';

export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

/** The preset editors' state, read from (and written back to) a cron expression. */
export interface ScheduleParts {
  frequency: ScheduleFrequency;
  minute: number;
  hour: number;
  /** Days of the week, 0 = Sunday. */
  weekdays: number[];
  dayOfMonth: number;
}

export const DEFAULT_SCHEDULE_PARTS: ScheduleParts = { frequency: 'custom', minute: 0, hour: 9, weekdays: [1, 2, 3, 4, 5], dayOfMonth: 1 };

const NUM = /^\d+$/;

/** Which preset an expression fits (`custom` when none), with the preset fields filled in. */
export function scheduleFromCron(expression: string): ScheduleParts {
  const parsed = parseCron(expression);
  if (!parsed.valid || expression.trim().startsWith('@')) return DEFAULT_SCHEDULE_PARTS;
  const [m = '', h = '', dom = '', mon = '', dow = ''] = parsed.cron.expression.split(' ');
  const base = { ...DEFAULT_SCHEDULE_PARTS, minute: NUM.test(m) ? Number(m) : 0 };
  if (!NUM.test(m) || mon !== '*') return DEFAULT_SCHEDULE_PARTS;
  if (h === '*' && dom === '*' && dow === '*') return { ...base, frequency: 'hourly' };
  if (!NUM.test(h)) return DEFAULT_SCHEDULE_PARTS;
  const timed = { ...base, hour: Number(h) };
  if (dom === '*' && dow === '*') return { ...timed, frequency: 'daily' };
  if (dom === '*') return { ...timed, frequency: 'weekly', weekdays: parsed.cron.dayOfWeek.values };
  if (dow === '*' && NUM.test(dom)) return { ...timed, frequency: 'monthly', dayOfMonth: Number(dom) };
  return DEFAULT_SCHEDULE_PARTS;
}

/** `[1,2,3,4,5]` → `"1-5"`, `[1,3,5]` → `"1,3,5"` (runs of three or more become ranges). */
export function compressCronList(values: number[]): string {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === (sorted[j] ?? 0) + 1) j++;
    if (j - i >= 2) parts.push(`${sorted[i]}-${sorted[j]}`);
    else for (let k = i; k <= j; k++) parts.push(String(sorted[k]));
    i = j + 1;
  }
  return parts.join(',');
}

/** The cron expression for a preset (`custom` returns `fallback`). */
export function cronFromSchedule(parts: ScheduleParts, fallback = ''): string {
  const { minute: m, hour: h } = parts;
  switch (parts.frequency) {
    case 'hourly':
      return `${m} * * * *`;
    case 'daily':
      return `${m} ${h} * * *`;
    case 'weekly':
      return `${m} ${h} * * ${compressCronList(parts.weekdays.length ? parts.weekdays : [1])}`;
    case 'monthly':
      return `${m} ${h} ${parts.dayOfMonth} * *`;
    default:
      return fallback;
  }
}
