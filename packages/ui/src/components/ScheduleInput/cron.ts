/**
 * 5-field cron (minute hour day-of-month month day-of-week): parse, describe, next runs.
 * Supports `*`, numbers, names (JAN–DEC, SUN–SAT), lists, ranges, steps (`*\/15`, `1-5/2`,
 * `10/5`), `7` as Sunday and the macros @yearly @annually @monthly @weekly @daily @midnight
 * @hourly. Day matching follows Vixie cron: when both day fields are restricted, either matches.
 */
import { interpolate, type MessageVars } from '../../i18n/format';
import { catalogs } from '../../i18n/messages';
import { en, type MessageKey, type Messages } from '../../i18n/messages/en';

export type CronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

export interface CronField {
  /** Matching values, sorted (day of week: 0 = Sunday … 6). */
  values: number[];
  /** The field starts with `*` (unrestricted for Vixie day matching). */
  wildcard: boolean;
  /** `n` when the field is exactly `*\/n`. */
  step?: number;
  /** The field as written. */
  source: string;
}

export interface ParsedCron {
  /** The five fields joined by single spaces (macros expanded). */
  expression: string;
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

export type CronErrorCode = 'empty' | 'fieldCount' | 'invalid' | 'range' | 'step' | 'macro';

export interface CronError {
  code: CronErrorCode;
  field?: CronFieldName;
  /** The offending token. */
  value?: string;
  /** Fields found (`fieldCount`). */
  count?: number;
  min?: number;
  max?: number;
  /** English message (translate with `cronErrorMessage`). */
  message: string;
}

export type CronParseResult = { valid: true; cron: ParsedCron; error?: undefined } | { valid: false; error: CronError; cron?: undefined };

/** A message translator, e.g. `useI18n().t`. */
export type CronTranslate = (key: MessageKey, vars?: MessageVars) => string;

const FIELDS: CronFieldName[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
const SPECS: Record<CronFieldName, { min: number; max: number; names?: string[] }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12, names: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] },
  dayOfWeek: { min: 0, max: 7, names: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] },
};
const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const enT: CronTranslate = (key, vars) => interpolate(en[key], vars, 'en');

function translatorFor(locale?: string): CronTranslate {
  const lang = (locale ?? 'en').split(/[-_]/)[0]?.toLowerCase() ?? 'en';
  const messages: Messages = (catalogs as Record<string, Messages | undefined>)[lang] ?? en;
  return (key, vars) => interpolate(messages[key] ?? en[key], vars, locale ?? 'en');
}

/** The message for a parse error, in the translator's language. */
export function cronErrorMessage(error: Omit<CronError, 'message'>, t: CronTranslate = enT): string {
  const field = error.field ? t(`cron.field.${error.field}`) : '';
  const vars = { field, value: error.value ?? '', count: error.count ?? 0, min: error.min ?? 0, max: error.max ?? 0 };
  return t(`cron.error.${error.code}`, vars);
}

class CronParseError extends Error {
  constructor(readonly detail: Omit<CronError, 'message'>) {
    super(cronErrorMessage(detail));
  }
}

function parseValue(token: string, field: CronFieldName): number {
  const spec = SPECS[field];
  const named = spec.names?.indexOf(token.toUpperCase()) ?? -1;
  if (named >= 0) return named + (field === 'month' ? 1 : 0);
  if (!/^\d+$/.test(token)) throw new CronParseError({ code: 'invalid', field, value: token });
  const n = Number(token);
  if (n < spec.min || n > spec.max) throw new CronParseError({ code: 'range', field, value: token, min: spec.min, max: field === 'dayOfWeek' ? 7 : spec.max });
  return n;
}

function parseField(source: string, field: CronFieldName): CronField {
  const spec = SPECS[field];
  const top = field === 'dayOfWeek' ? 6 : spec.max;
  const values = new Set<number>();
  for (const part of source.split(',')) {
    if (!part) throw new CronParseError({ code: 'invalid', field, value: source });
    const pieces = part.split('/');
    if (pieces.length > 2) throw new CronParseError({ code: 'step', field, value: part });
    const [rangePart = '', stepPart] = pieces;
    let step = 1;
    if (stepPart !== undefined) {
      if (!/^\d+$/.test(stepPart) || Number(stepPart) === 0) throw new CronParseError({ code: 'step', field, value: part });
      step = Number(stepPart);
    }
    let lo: number;
    let hi: number;
    if (rangePart === '*') {
      lo = spec.min;
      hi = top;
    } else if (rangePart.includes('-')) {
      const [a = '', b = '', ...rest] = rangePart.split('-');
      if (rest.length) throw new CronParseError({ code: 'invalid', field, value: part });
      lo = parseValue(a, field);
      hi = parseValue(b, field);
      if (hi < lo) throw new CronParseError({ code: 'invalid', field, value: part });
    } else {
      lo = parseValue(rangePart, field);
      hi = stepPart !== undefined ? top : lo;
    }
    for (let v = lo; v <= hi; v += step) values.add(field === 'dayOfWeek' && v === 7 ? 0 : v);
  }
  const stepMatch = /^\*\/(\d+)$/.exec(source);
  return {
    values: [...values].sort((a, b) => a - b),
    wildcard: source.startsWith('*'),
    step: stepMatch ? Number(stepMatch[1]) : undefined,
    source,
  };
}

/** Parses a 5-field cron expression (or a macro). Never throws. */
export function parseCron(expression: string): CronParseResult {
  const trimmed = expression.trim();
  const fail = (detail: Omit<CronError, 'message'>): CronParseResult => ({ valid: false, error: { ...detail, message: cronErrorMessage(detail) } });
  if (!trimmed) return fail({ code: 'empty' });
  let text = trimmed;
  if (trimmed.startsWith('@')) {
    const macro = MACROS[trimmed.toLowerCase()];
    if (!macro) return fail({ code: 'macro', value: trimmed });
    text = macro;
  }
  const tokens = text.split(/\s+/);
  if (tokens.length !== 5) return fail({ code: 'fieldCount', count: tokens.length });
  try {
    const parsed = Object.fromEntries(FIELDS.map((f, i) => [f, parseField(tokens[i] ?? '', f)])) as Record<CronFieldName, CronField>;
    return { valid: true, cron: { expression: tokens.join(' '), ...parsed } };
  } catch (e) {
    if (e instanceof CronParseError) return fail(e.detail);
    throw e;
  }
}

// ---------------------------------------------------------------- next runs

interface Wall {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
}

interface Zone {
  toWall: (ms: number) => Wall;
  /** The instant of a wall-clock minute, or null when it does not exist (DST gap). */
  toInstant: (w: Wall) => number | null;
}

const localZone: Zone = {
  toWall: (ms) => {
    const d = new Date(ms);
    return { y: d.getFullYear(), mo: d.getMonth(), d: d.getDate(), h: d.getHours(), mi: d.getMinutes() };
  },
  toInstant: (w) => {
    const d = new Date(w.y, w.mo, w.d, w.h, w.mi);
    return d.getHours() === w.h && d.getMinutes() === w.mi ? d.getTime() : null;
  },
};

function tzZone(timeZone: string): Zone {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  const parts = (ms: number) => {
    const p: Record<string, number> = {};
    for (const part of fmt.formatToParts(new Date(ms))) if (part.type !== 'literal') p[part.type] = Number(part.value);
    return { y: p.year ?? 0, mo: (p.month ?? 1) - 1, d: p.day ?? 1, h: (p.hour ?? 0) % 24, mi: p.minute ?? 0, s: p.second ?? 0 };
  };
  const offset = (ms: number) => {
    const p = parts(ms);
    return Date.UTC(p.y, p.mo, p.d, p.h, p.mi, p.s) - (ms - (((ms % 1000) + 1000) % 1000));
  };
  const same = (ms: number, w: Wall) => {
    const p = parts(ms);
    return p.y === w.y && p.mo === w.mo && p.d === w.d && p.h === w.h && p.mi === w.mi;
  };
  return {
    toWall: (ms) => parts(ms),
    toInstant: (w) => {
      const guess = Date.UTC(w.y, w.mo, w.d, w.h, w.mi);
      const first = guess - offset(guess);
      if (same(first, w)) return first;
      const second = guess - offset(first);
      return same(second, w) ? second : null;
    },
  };
}

function dayMatches(c: ParsedCron, dom: Set<number>, dow: Set<number>, day: number, weekday: number) {
  const domOk = dom.has(day);
  const dowOk = dow.has(weekday);
  return !c.dayOfMonth.wildcard && !c.dayOfWeek.wildcard ? domOk || dowOk : domOk && dowOk;
}

/**
 * The next `count` run times strictly after `from`, evaluated on the wall clock of `timeZone`
 * (IANA name, e.g. "Europe/Madrid"; default: the runtime's local zone). Wall times skipped by
 * a DST change are skipped. Returns `[]` for an invalid expression; throws RangeError for an
 * unknown time zone. Searches up to 8 years ahead (so "30 2 31 2 *" yields nothing).
 */
export function nextRuns(cron: string | ParsedCron, from: Date, count: number, timeZone?: string): Date[] {
  const parsed = typeof cron === 'string' ? parseCron(cron) : ({ valid: true, cron } as const);
  if (!parsed.valid || count <= 0) return [];
  const c = parsed.cron;
  const zone = timeZone ? tzZone(timeZone) : localZone;
  const minutes = c.minute.values;
  const hours = new Set(c.hour.values);
  const months = new Set(c.month.values);
  const dom = new Set(c.dayOfMonth.values);
  const dow = new Set(c.dayOfWeek.values);
  const fromMs = from.getTime();
  const start = zone.toWall(fromMs);
  // Wall-clock times are walked as UTC milliseconds (no DST inside the walk).
  let t = Date.UTC(start.y, start.mo, start.d, start.h, start.mi) + 60_000;
  const limit = Date.UTC(start.y + 8, start.mo, start.d);
  const out: Date[] = [];
  let last = fromMs;
  while (out.length < count && t < limit) {
    const w = new Date(t);
    const y = w.getUTCFullYear();
    const mo = w.getUTCMonth();
    const d = w.getUTCDate();
    const h = w.getUTCHours();
    const mi = w.getUTCMinutes();
    if (!months.has(mo + 1)) {
      t = Date.UTC(y, mo + 1, 1);
      continue;
    }
    if (!dayMatches(c, dom, dow, d, w.getUTCDay())) {
      t = Date.UTC(y, mo, d + 1);
      continue;
    }
    if (!hours.has(h)) {
      t = Date.UTC(y, mo, d, h + 1);
      continue;
    }
    const nextMinute = minutes.find((m) => m >= mi);
    if (nextMinute === undefined) {
      t = Date.UTC(y, mo, d, h + 1);
      continue;
    }
    if (nextMinute !== mi) {
      t = Date.UTC(y, mo, d, h, nextMinute);
      continue;
    }
    const instant = zone.toInstant({ y, mo, d, h, mi });
    if (instant !== null && instant > last) {
      out.push(new Date(instant));
      last = instant;
    }
    t += 60_000;
  }
  return out;
}

// ---------------------------------------------------------------- description

export interface DescribeCronOptions {
  /** Locale for weekday/month names and lists; also picks the built-in catalog. Default "en". */
  locale?: string;
  /** Translator (e.g. `useI18n().t`); defaults to the built-in catalog of `locale`. */
  t?: CronTranslate;
}

const pad = (n: number) => String(n).padStart(2, '0');
const isContiguous = (v: number[]) => v.length > 1 && v.every((n, i) => i === 0 || n === (v[i - 1] ?? 0) + 1);

/**
 * Plain-language summary: "Every weekday at 09:00", "Every 15 minutes, between 09:00 and
 * 17:59, on weekdays", "Monthly on day 1 at 00:00". Returns "" for an invalid expression.
 */
export function describeCron(cron: string | ParsedCron, options: DescribeCronOptions = {}): string {
  const parsed = typeof cron === 'string' ? parseCron(cron) : ({ valid: true, cron } as const);
  if (!parsed.valid) return '';
  const c = parsed.cron;
  const locale = options.locale ?? 'en';
  const t = options.t ?? translatorFor(locale);
  const list = (items: string[]) => new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
  const weekdayName = (d: number) => new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + d)));
  const monthName = (m: number) => new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, m - 1, 1)));

  const M = c.minute.values;
  const H = c.hour.values;
  const allMinutes = M.length === 60;
  const allHours = H.length === 24;
  const hourQualifier = () =>
    isContiguous(H)
      ? t('cron.betweenHours', { start: `${pad(H[0] ?? 0)}:00`, end: `${pad(H[H.length - 1] ?? 0)}:59` })
      : t('cron.duringHours', { count: H.length, hours: list(H.map(String)) });

  const qualifiers: string[] = [];
  let base: string;
  let times: string | null = null;
  if (allMinutes) {
    base = t('cron.everyMinute');
    if (!allHours) qualifiers.push(hourQualifier());
  } else if (c.minute.step && c.minute.step > 1) {
    base = t('cron.everyNMinutes', { count: c.minute.step });
    if (!allHours) qualifiers.push(hourQualifier());
  } else if (allHours) {
    base = M.length === 1 && M[0] === 0 ? t('cron.everyHour') : t('cron.everyHourAt', { count: M.length, minutes: list(M.map(String)) });
  } else if (c.hour.step && c.hour.step > 1 && M.length === 1) {
    const minute = M[0] ?? 0;
    base = minute === 0 ? t('cron.everyNHours', { count: c.hour.step }) : t('cron.everyNHoursAt', { count: c.hour.step, minute });
  } else if (M.length * H.length <= 6) {
    times = list(H.flatMap((h) => M.map((m) => `${pad(h)}:${pad(m)}`)));
    base = t('cron.at', { times });
  } else {
    base = t('cron.minutesPast', { count: M.length, minutes: list(M.map(String)) });
    qualifiers.push(hourQualifier());
  }

  const domRestricted = c.dayOfMonth.values.length < 31;
  const dowRestricted = c.dayOfWeek.values.length < 7;
  const dowOrdered = [...c.dayOfWeek.values].sort((a, b) => (a || 7) - (b || 7));
  const weekdaysOnly = dowOrdered.join(',') === '1,2,3,4,5';
  const days = list(dowOrdered.map(weekdayName));
  const domList = list(c.dayOfMonth.values.map(String));
  const domQualifier = t('cron.onDaysOfMonth', { count: c.dayOfMonth.values.length, days: domList });
  const dowQualifier = weekdaysOnly ? t('cron.onWeekdays') : t('cron.onDays', { days });
  const bothDays = domRestricted && dowRestricted;
  const eitherDay = bothDays && !c.dayOfMonth.wildcard && !c.dayOfWeek.wildcard;

  if (times !== null && !bothDays) {
    if (dowRestricted) base = weekdaysOnly ? t('cron.weekdaysAt', { times }) : t('cron.weeklyAt', { days, times });
    else if (domRestricted) base = t('cron.monthlyAt', { count: c.dayOfMonth.values.length, days: domList, times });
    else base = t('cron.dailyAt', { times });
  } else if (bothDays) {
    qualifiers.push(eitherDay ? t('cron.or', { a: domQualifier, b: dowQualifier }) : `${domQualifier}, ${dowQualifier}`);
  } else if (domRestricted) qualifiers.push(domQualifier);
  else if (dowRestricted) qualifiers.push(dowQualifier);

  if (c.month.values.length < 12) qualifiers.push(t('cron.inMonths', { months: list(c.month.values.map(monthName)) }));
  return qualifiers.reduce((acc, part) => t('cron.join', { base: acc, part }), base);
}
