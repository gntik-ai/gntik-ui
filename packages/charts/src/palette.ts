import { SERIES_TOKENS, type ChartColor } from './theme';

/**
 * Data-viz palette built ONLY from the frozen brand tokens.
 *
 * Categorical: `SAFE_CHART_COLORS` orders the five accents so that every adjacent pair differs
 * in relative luminance by at least 1.5:1 in dark, light and high_contrast (asserted by
 * `palette.test.ts` against `@gntik-ai/tokens/brand.css`). The legacy `CHART_COLORS` order keeps
 * cyan next to amber, which are near-identical in luminance in dark/high_contrast.
 *
 * Colour-blind safety: hue alone is never the only channel. Charts pair colour with position,
 * labels or the legend text; use at most five categorical series, prefer a sequential ramp
 * (one hue, varying lightness) for ordered data, and a diverging ramp (destructive ↔ muted ↔
 * primary, i.e. red ↔ green, which deutan/protan viewers confuse) only together with value
 * labels, a signed legend or the `dataTable` fallback — lightness still separates the ends.
 */
export const SAFE_CHART_COLORS: readonly ChartColor[] = ['primary', 'violet', 'cyan', 'rose', 'amber'];

/** A CSS custom property name of a brand token (`--primary`, `--destructive`…). */
export type TokenName = `--${string}`;

export interface SequentialRampOptions {
  /** Hue of the ramp (series colour name). Default `primary`. */
  color?: ChartColor;
  /** Surface the ramp fades into. Default `--card`. */
  surface?: TokenName;
  /**
   * `mix` (default): opaque `color-mix(in oklab, …)` steps — safe for overlapping marks and text on top.
   * `alpha`: `hsl(var(--token) / a)` steps that let the underlying surface show through.
   */
  mode?: 'mix' | 'alpha';
  /** Strength of the weakest step, 0–1. Default 0.14. */
  min?: number;
}

export interface DivergingRampOptions {
  /** Token for the low end. Default `--destructive`. */
  negative?: TokenName;
  /** Token for the high end. Default `--primary`. */
  positive?: TokenName;
  /** Token for the neutral midpoint. Default `--muted`. */
  mid?: TokenName;
  mode?: 'mix' | 'alpha';
  /** Strength of the weakest non-neutral step, 0–1. Default 0.18. */
  min?: number;
}

const round = (n: number) => Math.round(n * 1000) / 1000;
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const solid = (token: TokenName) => `hsl(var(${token}))`;

/** Mixes `token` into `base` at `weight` (0–1); `weight` 1 is the plain token. */
function mix(token: TokenName, base: TokenName, weight: number, mode: 'mix' | 'alpha'): string {
  if (weight >= 1) return solid(token);
  if (mode === 'alpha') return `hsl(var(${token}) / ${round(weight)})`;
  return `color-mix(in oklab, ${solid(token)} ${pct(weight)}, ${solid(base)})`;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * `n` colours from faint to the full token, for ordered magnitudes (heatmaps, choropleths,
 * funnel stages). Every value is a CSS colour string usable as SVG fill/stroke or inline style.
 */
export function sequentialRamp(n: number, options: SequentialRampOptions = {}): string[] {
  const { color = 'primary', surface = '--card', mode = 'mix', min = 0.14 } = options;
  const token = SERIES_TOKENS[color] as TokenName;
  const count = Math.max(0, Math.floor(n));
  const lo = clamp01(min);
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 1 : lo + ((1 - lo) * i) / (count - 1);
    return mix(token, surface, t, mode);
  });
}

/**
 * `n` colours from `negative` (index 0) through the neutral `mid` to `positive` (last index),
 * for signed values around a meaningful centre (deltas, budgets, sentiment). With an odd `n`
 * the middle step is the plain neutral token.
 */
export function divergingRamp(n: number, options: DivergingRampOptions = {}): string[] {
  const { negative = '--destructive', positive = '--primary', mid = '--muted', mode = 'mix', min = 0.18 } = options;
  const count = Math.max(0, Math.floor(n));
  const lo = clamp01(min);
  // Smallest non-zero distance from the centre (odd counts have an exact neutral step).
  const dMin = count % 2 ? 2 / (count - 1) : 1 / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    if (count === 1) return solid(mid);
    const d = (i / (count - 1)) * 2 - 1; // −1 … 1
    const a = Math.abs(d);
    if (a < 1e-9) return solid(mid);
    const strength = a >= 1 - 1e-9 ? 1 : lo + ((1 - lo) * (a - dMin)) / (1 - dMin);
    return mix(d < 0 ? negative : positive, mid, strength, mode);
  });
}

/**
 * Index of the ramp step for `value`. `domain` is `[min, max]` (sequential) or
 * `[min, mid, max]` (diverging: `mid` maps to the centre of the ramp).
 */
export function rampIndex(
  value: number,
  domain: readonly [number, number] | readonly [number, number, number],
  steps: number,
): number {
  if (steps <= 1 || !Number.isFinite(value)) return 0;
  let t: number;
  if (domain.length === 3) {
    const [lo, mid, hi] = domain;
    t =
      value <= mid
        ? 0.5 * (mid === lo ? 1 : (value - lo) / (mid - lo))
        : 0.5 + 0.5 * (hi === mid ? 1 : (value - mid) / (hi - mid));
  } else {
    const [lo, hi] = domain;
    t = hi === lo ? 1 : (value - lo) / (hi - lo);
  }
  return Math.min(steps - 1, Math.floor(clamp01(t) * steps));
}

/** Colour of `value` on `ramp` (see `rampIndex`). */
export function rampColor(
  value: number,
  domain: readonly [number, number] | readonly [number, number, number],
  ramp: readonly string[],
): string {
  return ramp[rampIndex(value, domain, ramp.length)] ?? ramp[0] ?? solid('--muted');
}
