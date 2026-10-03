import { readFileSync } from 'node:fs';
import {
  CHART_COLORS,
  SAFE_CHART_COLORS,
  SERIES_TOKENS,
  chartFmt,
  divergingRamp,
  rampColor,
  rampIndex,
  sequentialRamp,
} from './index';

type Vars = Record<string, string>;

// Same parser and WCAG luminance as packages/tokens/test/tokens.test.mjs.
function parse(text: string): Record<string, Vars> {
  const out: Record<string, Vars> = {};
  const re = /(:root|\.dark|\.high_contrast)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const vars: Vars = (out[m[1] ?? ''] = {});
    for (const decl of (m[2] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const key = decl.slice(0, i).trim();
      if (key.startsWith('--')) vars[key] = decl.slice(i + 1).trim();
    }
  }
  return out;
}

function luminance(channels: string): number {
  const [h = 0, s = 0, l = 0] = channels.split(/\s+/).map((v) => parseFloat(v));
  const S = s / 100;
  const L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(f(0)) + 0.7152 * lin(f(8)) + 0.0722 * lin(f(4));
}
const ratio = (a: string, b: string) => {
  const [x = 0, y = 0] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// The frozen brand tokens (workspace source of @gntik-ai/tokens/brand.css). Vitest may serve
// the URL under its /@fs prefix, so strip it to get the file-system path.
const brandPath = decodeURIComponent(new URL('../../tokens/src/brand.css', import.meta.url).pathname).replace(/^\/@fs/, '');
const brand = parse(readFileSync(brandPath, 'utf8'));
const THEMES = [':root', '.dark', '.high_contrast'] as const;
const tokensOf = (theme: string): Vars => ({
  ...brand[':root'],
  ...brand[theme],
});

describe('categorical palette (colour-blind safety)', () => {
  it.each(THEMES)('adjacent SAFE_CHART_COLORS differ in luminance by ≥ 1.5:1 in %s', (theme) => {
    const tokens = tokensOf(theme);
    for (let i = 1; i < SAFE_CHART_COLORS.length; i++) {
      const a = tokens[SERIES_TOKENS[SAFE_CHART_COLORS[i - 1]!]]!;
      const b = tokens[SERIES_TOKENS[SAFE_CHART_COLORS[i]!]]!;
      expect(ratio(a, b), `${theme} ${SAFE_CHART_COLORS[i - 1]} → ${SAFE_CHART_COLORS[i]}`).toBeGreaterThanOrEqual(1.5);
    }
  });

  it.each(THEMES)('every categorical colour stands out from the card (≥ 2:1, non-text) in %s', (theme) => {
    const tokens = tokensOf(theme);
    for (const c of SAFE_CHART_COLORS) expect(ratio(tokens[SERIES_TOKENS[c]]!, tokens['--card']!)).toBeGreaterThanOrEqual(2);
  });

  it('uses the same five accents as CHART_COLORS', () => {
    expect([...SAFE_CHART_COLORS].sort()).toEqual([...CHART_COLORS].sort());
  });
});

describe('ramps', () => {
  it('sequentialRamp mixes the token into the card, ending at the plain token', () => {
    const r = sequentialRamp(4);
    expect(r).toHaveLength(4);
    expect(r[0]).toBe('color-mix(in oklab, hsl(var(--primary)) 14%, hsl(var(--card)))');
    expect(r[3]).toBe('hsl(var(--primary))');
    expect(sequentialRamp(3, { mode: 'alpha', color: 'violet' })).toEqual([
      'hsl(var(--category-violet) / 0.14)',
      'hsl(var(--category-violet) / 0.57)',
      'hsl(var(--category-violet))',
    ]);
    expect(sequentialRamp(1)).toEqual(['hsl(var(--primary))']);
    expect(sequentialRamp(0)).toEqual([]);
  });

  it('divergingRamp runs destructive → muted → primary with increasing strength', () => {
    const r = divergingRamp(5);
    expect(r[0]).toBe('hsl(var(--destructive))');
    expect(r[1]).toBe('color-mix(in oklab, hsl(var(--destructive)) 18%, hsl(var(--muted)))');
    expect(r[2]).toBe('hsl(var(--muted))');
    expect(r[3]).toBe('color-mix(in oklab, hsl(var(--primary)) 18%, hsl(var(--muted)))');
    expect(r[4]).toBe('hsl(var(--primary))');
    const even = divergingRamp(6);
    expect(even).not.toContain('hsl(var(--muted))');
    expect(even[2]).toContain('--destructive');
    expect(even[3]).toContain('--primary');
  });

  it('ramps only reference brand tokens (no literal colours)', () => {
    for (const c of [...sequentialRamp(7), ...divergingRamp(7), ...sequentialRamp(5, { mode: 'alpha' })]) {
      expect(c).not.toMatch(/#|rgb|\bhsl\(\d/);
      expect(c).toMatch(/var\(--/);
    }
  });

  it('rampIndex buckets sequential and diverging domains', () => {
    expect(rampIndex(0, [0, 100], 5)).toBe(0);
    expect(rampIndex(100, [0, 100], 5)).toBe(4);
    expect(rampIndex(50, [0, 100], 5)).toBe(2);
    expect(rampIndex(-10, [0, 100], 5)).toBe(0);
    expect(rampIndex(0, [-20, 0, 80], 5)).toBe(2);
    expect(rampIndex(-20, [-20, 0, 80], 5)).toBe(0);
    expect(rampIndex(80, [-20, 0, 80], 5)).toBe(4);
    expect(rampColor(100, [0, 100], ['a', 'b'])).toBe('b');
  });
});

describe('chartFmt (extended)', () => {
  it('formats percent, duration and bytes', () => {
    expect(chartFmt.percent(0.125)).toBe('12.5%');
    expect(chartFmt.percentDelta(0.042)).toBe('+4.2%');
    expect(chartFmt.percentDelta(-0.1)).toBe('−10%');
    expect(chartFmt.duration(850)).toBe('850 ms');
    expect(chartFmt.duration(2400)).toBe('2.4 s');
    expect(chartFmt.duration(3_723_000)).toBe('1h 2m');
    expect(chartFmt.duration(3_605_000)).toBe('1h');
    expect(chartFmt.durationS(90)).toBe('1m 30s');
    expect(chartFmt.duration(90_000_000)).toBe('1d 1h');
    expect(chartFmt.bytes(512)).toBe('512 B');
    expect(chartFmt.bytes(1536)).toBe('1.5 kB');
    expect(chartFmt.bytes(2_000_000_000)).toBe('2 GB');
  });
});
