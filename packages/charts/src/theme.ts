import { useSyncExternalStore } from 'react';
import { currentTheme, observeTheme, tokenChannels, tokenColor, type Theme } from '@gntik-ai/tokens/runtime';

/** Series colour name → brand token. Green primary is the hero; the rest are categorical accents. */
export const SERIES_TOKENS = {
  primary: '--primary',
  emerald: '--brand-accent',
  violet: '--category-violet',
  cyan: '--category-cyan',
  amber: '--category-amber',
  rose: '--category-rose',
  info: '--info',
} as const;

export type ChartColor = keyof typeof SERIES_TOKENS;

/**
 * Default series order: primary first, then the categorical accents ordered so every adjacent
 * pair differs in luminance by ≥ 1.5:1 in all three themes (see `palette.ts`).
 */
export const CHART_COLORS: readonly ChartColor[] = ['primary', 'violet', 'cyan', 'rose', 'amber'];

/** Palettes may define `--chart-series-1`…`--chart-series-12`; series beyond that wrap around. */
const SERIES_COUNT = 12;

export interface ChartTheme {
  /** Active theme ("dark" | "light" | "high_contrast"); "dark" on the server and during hydration. */
  theme: Theme;
  grid: string;
  axis: string;
  text: string;
  /** Line/area hover cursor. */
  cursor: string;
  /** Bar hover band. */
  barCursor: string;
  /** Card surface (donut slice separators). */
  surface: string;
  /** Colour for a series name, with optional alpha (0–1). */
  color: (name: ChartColor, alpha?: number) => string;
  /**
   * Default colour for the i-th series (0-based): the palette's `--chart-series-N` token, or the
   * matching `CHART_COLORS` accent when the palette defines none.
   */
  series: (index: number, alpha?: number) => string;
}

type ColorFn = (token: string, alpha?: number) => string;

/** `hsl(var(--token))`: resolved by the browser (SVG fill/stroke and inline styles), so it is SSR-safe and follows theme switches. */
const cssVarColor: ColorFn = (token, alpha) => (alpha == null ? `hsl(var(${token}))` : `hsl(var(${token}) / ${alpha})`);

type SeriesFn = (index: number, alpha?: number) => string;

const seriesName = (index: number) => `--chart-series-${(index % SERIES_COUNT) + 1}`;
const defaultToken = (index: number) => SERIES_TOKENS[CHART_COLORS[index % CHART_COLORS.length] ?? 'primary'];

/** Unset series tokens fall through `var()` to today's accent token, so other palettes are unchanged. */
const cssVarSeries: SeriesFn = (index, alpha) => {
  const channels = `var(${seriesName(index)}, var(${defaultToken(index)}))`;
  return alpha == null ? `hsl(${channels})` : `hsl(${channels} / ${alpha})`;
};

/** Resolved colours cannot use a `var()` fallback, so an undefined (empty) series token uses the accent. */
const resolvedSeries: SeriesFn = (index, alpha) =>
  tokenColor(tokenChannels(seriesName(index)) ? seriesName(index) : defaultToken(index), alpha);

function buildTheme(theme: Theme, c: ColorFn, series: SeriesFn): ChartTheme {
  return {
    theme,
    grid: c('--border'),
    axis: c('--muted-foreground', 0.5),
    text: c('--muted-foreground'),
    cursor: c('--muted-foreground', 0.32),
    barCursor: c('--secondary', 0.55),
    surface: c('--card'),
    color: (name, alpha) => c(SERIES_TOKENS[name] ?? SERIES_TOKENS.primary, alpha),
    series,
  };
}

// Snapshots are cached so useSyncExternalStore gets a stable object between theme changes.
const varThemes = new Map<Theme, ChartTheme>();
let resolvedSnapshot: ChartTheme | null = null;

function varTheme(theme: Theme): ChartTheme {
  let t = varThemes.get(theme);
  if (!t) {
    t = buildTheme(theme, cssVarColor, cssVarSeries);
    varThemes.set(theme, t);
  }
  return t;
}

function subscribe(onChange: () => void) {
  // Invalidate the resolved snapshot on every class change, even when the theme name stays the same.
  return observeTheme(() => {
    resolvedSnapshot = null;
    onChange();
  });
}

const SERVER_THEME = varTheme('dark');
const getServerSnapshot = () => SERVER_THEME;
const getVarSnapshot = () => varTheme(currentTheme());
function getResolvedSnapshot() {
  const theme = currentTheme();
  if (!resolvedSnapshot || resolvedSnapshot.theme !== theme)
    resolvedSnapshot = buildTheme(theme, (token, alpha) => tokenColor(token, alpha), resolvedSeries);
  return resolvedSnapshot;
}

export interface UseChartThemeOptions {
  /**
   * Resolve the tokens to concrete `hsl(h s% l%)` strings (read from the DOM after hydration),
   * for consumers that cannot use `var()` (canvas, colour maths). Default: `hsl(var(--token))`.
   */
  resolved?: boolean;
}

/**
 * Brand colours for Recharts. By default every colour is a `hsl(var(--token))` string: SVG
 * fill/stroke attributes and inline styles resolve it, so server and client render the same
 * markup and a theme switch re-skins the chart without re-rendering. `theme` follows the
 * <html> class after mount. With `{ resolved: true }` colours are read from the live CSS
 * variables once mounted (the server and hydration render use the `var()` strings).
 */
export function useChartTheme({ resolved = false }: UseChartThemeOptions = {}): ChartTheme {
  return useSyncExternalStore(subscribe, resolved ? getResolvedSnapshot : getVarSnapshot, getServerSnapshot);
}

/** Colour for the i-th series: cycles an explicit `colors`, else the palette's default series. */
export function seriesColor(t: ChartTheme, colors: readonly ChartColor[] | undefined, i: number): string {
  if (!colors) return t.series(i);
  const name = colors.length ? colors[i % colors.length] : undefined;
  return t.color(name ?? 'primary');
}
