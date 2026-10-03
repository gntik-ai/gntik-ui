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
  /** Ratio (0–1) → percent with up to one decimal: `0.125` → `12.5%`. */
  percent: (n: number) => nf({ style: 'percent', maximumFractionDigits: 1 }).format(n),
  /** Signed ratio for deltas: `0.042` → `+4.2%`, `-0.1` → `−10%`. */
  percentDelta: (n: number) => nf({ style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(n).replace('-', '−'),
  /** Milliseconds → the two largest units: `850` → `850 ms`, `2400` → `2.4 s`, `3_723_000` → `1h 2m`. */
  duration: (n: number) => formatDuration(n),
  /** Seconds → like `duration`: `90` → `1m 30s`. */
  durationS: (n: number) => formatDuration(n * 1000),
  /** Bytes → decimal SI units: `1536` → `1.5 kB`, `2_000_000_000` → `2 GB`. */
  bytes: (n: number) => formatBytes(n),
} satisfies Record<string, ValueFormatter>;

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  const sign = ms < 0 ? '−' : '';
  const a = Math.abs(ms);
  if (a < 1000) return `${sign}${nf({ maximumFractionDigits: a < 10 ? 2 : 0 }).format(a)} ms`;
  if (a < 60_000) return `${sign}${nf({ maximumFractionDigits: 1 }).format(a / 1000)} s`;
  const parts: Array<[number, string]> = [
    [86_400_000, 'd'],
    [3_600_000, 'h'],
    [60_000, 'm'],
    [1000, 's'],
  ];
  const total = Math.round(a / 1000) * 1000;
  const first = parts.findIndex(([size]) => total >= size);
  const out: string[] = [];
  let rest = total;
  for (const [size, unit] of parts.slice(first, first + 2)) {
    const q = Math.floor(rest / size);
    rest -= q * size;
    if (q > 0) out.push(`${q}${unit}`);
  }
  return sign + out.join(' ');
}

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] as const;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '—';
  const sign = bytes < 0 ? '−' : '';
  let v = Math.abs(bytes);
  let u = 0;
  while (v >= 1000 && u < BYTE_UNITS.length - 1) {
    v /= 1000;
    u += 1;
  }
  return `${sign}${nf({ maximumFractionDigits: u === 0 ? 0 : 1 }).format(v)} ${BYTE_UNITS[u]}`;
}

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
