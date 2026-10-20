import type { MessageKey, Messages } from './messages/en';

/** Values interpolated into a message: `{name}` placeholders and plural selectors. */
export type MessageVars = Record<string, string | number>;

/** Options for locale-aware byte or bit sizes. */
export interface FormatBytesOptions {
  /** BCP 47 locale; defaults to English. */
  locale?: string;
  /** Decimal SI (default) or binary IEC multiples. Bits always use 1000. */
  base?: 1000 | 1024;
  /** The input's unit; defaults to bytes. */
  unit?: 'byte' | 'bit';
  /** Intl label width; binary multiples always use IEC symbols. Defaults to short. */
  unitDisplay?: 'short' | 'long' | 'narrow';
  /** Maximum decimals above the base unit; defaults to 1. */
  maximumFractionDigits?: number;
}

/**
 * Formats a size with localized Intl unit labels, rounding into the next unit when needed.
 * Bytes scale through petabytes, bits through terabits; non-finite values return `—`.
 * A string second argument remains shorthand for the locale.
 * @example formatBytes(1536, 'es') // '1,5 kB'
 * @example formatBytes(26_214_400, { base: 1024 }) // '25 MiB'
 */
export function formatBytes(value: number, options: string | FormatBytesOptions = {}): string {
  if (!Number.isFinite(value)) return '—';
  const {
    locale = 'en',
    base = 1000,
    unit = 'byte',
    unitDisplay = 'short',
    maximumFractionDigits = 1,
  } = typeof options === 'string' ? { locale: options } : options;
  const scale = unit === 'bit' ? 1000 : base;
  const prefixes = ['', 'kilo', 'mega', 'giga', 'tera', 'peta'];
  const last = unit === 'bit' ? 4 : 5;
  let magnitude = Math.abs(value);
  let index = 0;
  while (magnitude >= scale && index < last) {
    magnitude /= scale;
    index++;
  }
  // Intl rounding also handles decimal ties that binary toFixed can round down.
  const rounded = new Intl.NumberFormat('en', {
    maximumFractionDigits: index === 0 ? 0 : maximumFractionDigits,
    useGrouping: false,
  }).format(magnitude);
  if (Number(rounded) >= scale && index < last) {
    magnitude /= scale;
    index++;
  }
  const signed = value < 0 ? -magnitude : magnitude;
  const numberOptions = { maximumFractionDigits: index === 0 ? 0 : maximumFractionDigits };
  if ((unit === 'byte' && index === 0 && unitDisplay === 'short') || (scale === 1024 && index > 0)) {
    const symbol = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'][index];
    return `${new Intl.NumberFormat(locale, numberOptions).format(signed)} ${symbol}`;
  }
  return new Intl.NumberFormat(locale, {
    ...numberOptions,
    style: 'unit',
    unit: `${prefixes[index]}${unit}`,
    unitDisplay,
  }).format(signed);
}

/** Scripts written right to left (language subtag). */
const RTL_LANGUAGES = new Set(['ar', 'arc', 'ckb', 'dv', 'fa', 'he', 'iw', 'ks', 'ku', 'ps', 'sd', 'ug', 'ur', 'yi']);

/** `rtl` for Arabic, Hebrew, Persian, Urdu… (by language subtag or Intl text info), else `ltr`. */
export function localeDirection(locale: string): 'ltr' | 'rtl' {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      getTextInfo?: () => { direction?: string };
      textInfo?: { direction?: string };
    };
    const info = loc.getTextInfo?.() ?? loc.textInfo;
    if (info?.direction === 'rtl' || info?.direction === 'ltr') return info.direction;
    return RTL_LANGUAGES.has(loc.language) ? 'rtl' : 'ltr';
  } catch {
    return RTL_LANGUAGES.has(locale.split(/[-_]/)[0]?.toLowerCase() ?? '') ? 'rtl' : 'ltr';
  }
}

/** Index of the brace closing the one at `open` (nested braces allowed). */
function matchBrace(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return i;
  }
  return -1;
}

/** `one {# item} other {# items}` → `{ one: '# item', other: '# items' }`. */
function parseBranches(body: string): Record<string, string> {
  const branches: Record<string, string> = {};
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf('{', i);
    if (open < 0) break;
    const name = body.slice(i, open).trim();
    const close = matchBrace(body, open);
    if (close < 0) break;
    branches[name] = body.slice(open + 1, close);
    i = close + 1;
  }
  return branches;
}

/** Fills `{name}` placeholders and `{count, plural, one {…} other {…}}` selectors. */
export function interpolate(template: string, vars: MessageVars | undefined, locale: string): string {
  if (!vars || !template.includes('{')) return template;
  let out = '';
  let i = 0;
  while (i < template.length) {
    const open = template.indexOf('{', i);
    if (open < 0) {
      out += template.slice(i);
      break;
    }
    out += template.slice(i, open);
    const close = matchBrace(template, open);
    if (close < 0) {
      out += template.slice(open);
      break;
    }
    const inner = template.slice(open + 1, close);
    const plural = /^\s*(\w+)\s*,\s*plural\s*,(.*)$/s.exec(inner);
    if (plural) {
      const name = plural[1] ?? '';
      const n = Number(vars[name] ?? 0);
      const branches = parseBranches(plural[2] ?? '');
      const rule = new Intl.PluralRules(locale).select(n);
      const branch = branches[`=${n}`] ?? branches[rule] ?? branches.other ?? '';
      out += interpolate(branch.replaceAll('#', new Intl.NumberFormat(locale).format(n)), vars, locale);
    } else {
      const value = vars[inner.trim()];
      out += value === undefined ? `{${inner}}` : String(value);
    }
    i = close + 1;
  }
  return out;
}

export type DateValue = Date | number | string;
const toDate = (value: DateValue) => (value instanceof Date ? value : new Date(value));

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/** The translator and Intl formatters for one locale. */
export interface I18nFormatters {
  /** Translates a built-in key, filling placeholders. */
  t: (key: MessageKey, vars?: MessageVars) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatBytes: (value: number, options?: FormatBytesOptions) => string;
  formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: DateValue, options?: Intl.DateTimeFormatOptions) => string;
  /**
   * Relative time. With a unit, formats `value` in it ("in 3 days"); with a date, picks the
   * largest fitting unit against `now` ("5 minutes ago").
   */
  formatRelativeTime: {
    (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions): string;
    (value: Date, now?: Date | number, options?: Intl.RelativeTimeFormatOptions): string;
  };
  formatList: (items: readonly string[], options?: Intl.ListFormatOptions) => string;
}

export function createFormatters(locale: string, messages: Messages): I18nFormatters {
  function formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ): string;
  function formatRelativeTime(value: Date, now?: Date | number, options?: Intl.RelativeTimeFormatOptions): string;
  function formatRelativeTime(
    value: number | Date,
    unitOrNow?: Intl.RelativeTimeFormatUnit | Date | number,
    options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' },
  ): string {
    const rtf = new Intl.RelativeTimeFormat(locale, options);
    if (typeof value === 'number' && typeof unitOrNow === 'string') return rtf.format(value, unitOrNow);
    const now =
      unitOrNow instanceof Date ? unitOrNow.getTime() : typeof unitOrNow === 'number' ? unitOrNow : Date.now();
    const seconds = Math.round((toDate(value).getTime() - now) / 1000);
    const [unit, size] = RELATIVE_UNITS.find(([, s]) => Math.abs(seconds) >= s) ?? ['second', 1];
    return rtf.format(Math.round(seconds / size), unit);
  }
  return {
    t: (key, vars) => interpolate(messages[key] ?? key, vars, locale),
    formatNumber: (value, options) => new Intl.NumberFormat(locale, options).format(value),
    formatBytes: (value, options) => formatBytes(value, { locale, ...options }),
    formatCurrency: (value, currency, options) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(value),
    formatDate: (value, options = { dateStyle: 'medium' }) =>
      new Intl.DateTimeFormat(locale, options).format(toDate(value)),
    formatRelativeTime,
    formatList: (items, options = { style: 'long', type: 'conjunction' }) =>
      new Intl.ListFormat(locale, options).format(items),
  };
}
