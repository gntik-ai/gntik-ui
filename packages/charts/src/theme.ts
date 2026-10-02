import { useEffect, useState } from 'react';
import { currentTheme, observeTheme, tokenColor, type Theme } from '@gntik-ai/tokens/runtime';

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

/** Default series order: primary first, then the categorical accents. */
export const CHART_COLORS: readonly ChartColor[] = ['primary', 'violet', 'cyan', 'amber', 'rose'];

export interface ChartTheme {
  /** Active theme ("dark" | "light" | "high_contrast"). */
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
  /** Resolved colour for a series name, with optional alpha (0–1). */
  color: (name: ChartColor, alpha?: number) => string;
}

function readTheme(theme: Theme): ChartTheme {
  return {
    theme,
    grid: tokenColor('--border'),
    axis: tokenColor('--muted-foreground', 0.5),
    text: tokenColor('--muted-foreground'),
    cursor: tokenColor('--muted-foreground', 0.32),
    barCursor: tokenColor('--secondary', 0.55),
    surface: tokenColor('--card'),
    color: (name, alpha) => tokenColor(SERIES_TOKENS[name] ?? SERIES_TOKENS.primary, alpha),
  };
}

/**
 * Resolves the brand tokens to concrete colours for Recharts (SVG attributes cannot use
 * `var()`), via `@gntik-ai/tokens/runtime`. Re-reads them whenever the theme class changes.
 */
export function useChartTheme(): ChartTheme {
  const [snapshot, setSnapshot] = useState<ChartTheme>(() => readTheme(currentTheme()));
  // Re-read on every class change, even when the theme name stays the same.
  useEffect(() => observeTheme((next) => setSnapshot(readTheme(next))), []);
  return snapshot;
}

/** Colour for the i-th series, cycling through `colors`. */
export function seriesColor(t: ChartTheme, colors: readonly ChartColor[], i: number): string {
  const name = colors.length ? colors[i % colors.length] : undefined;
  return t.color(name ?? 'primary');
}
