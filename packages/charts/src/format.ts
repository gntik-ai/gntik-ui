/** Formats a numeric value for axes, tooltips and legends. */
export type ValueFormatter = (value: number) => string;

const nf = (opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', opts);

/** Ready-made value formatters (en-US). */
export const chartFmt = {
  usd: (n: number) => '$' + nf({ maximumFractionDigits: 0 }).format(n),
  usd2: (n: number) => '$' + nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
  usdCompact: (n: number) => '$' + nf({ notation: 'compact', maximumFractionDigits: 1 }).format(n),
  num: (n: number) => nf().format(n),
  compact: (n: number) => nf({ notation: 'compact', maximumFractionDigits: 1 }).format(n),
  ms: (n: number) => nf().format(n) + ' ms',
  pct: (n: number) => `${n}%`,
} satisfies Record<string, ValueFormatter>;

export const identity: ValueFormatter = (n) => String(n);

/** Applies a formatter to whatever Recharts hands over (number, string or range). */
export function formatAny(value: unknown, fmt: ValueFormatter): string {
  if (typeof value === 'number') return fmt(value);
  if (Array.isArray(value)) return value.map((v) => formatAny(v, fmt)).join(' – ');
  return value == null ? '' : String(value);
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
