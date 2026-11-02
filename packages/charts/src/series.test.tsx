import type { ReactElement } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import {
  AreaChart,
  BarChart,
  CHART_COLORS,
  DonutChart,
  LineChart,
  RadarChart,
  SERIES_TOKENS,
  SankeyChart,
  useChartTheme,
} from './index';
import { seriesColor } from './theme';

// Seven series, slices or nodes: more than CHART_COLORS holds, so the cycle wraps.
const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const rows: Array<Record<string, string | number>> = ['Q1', 'Q2', 'Q3'].map((q) => ({
  q,
  ...Object.fromEntries(names.map((n, i) => [n, 10 + i])),
}));
const slices = names.map((name, i) => ({ name, value: 10 + i }));
const nodes = names.map((name) => ({ name }));
const flows = names.slice(1).map((name) => ({ source: 'a', target: name, value: 5 }));

const charts: Array<[string, (colors?: readonly (keyof typeof SERIES_TOKENS)[]) => ReactElement]> = [
  ['BarChart', (colors) => <BarChart aria-label="Bar" data={rows} index="q" categories={names} colors={colors} />],
  ['LineChart', (colors) => <LineChart aria-label="Line" data={rows} index="q" categories={names} colors={colors} />],
  ['AreaChart', (colors) => <AreaChart aria-label="Area" data={rows} index="q" categories={names} colors={colors} />],
  [
    'RadarChart',
    (colors) => <RadarChart aria-label="Radar" data={rows} index="q" categories={names} colors={colors} />,
  ],
  [
    'DonutChart',
    (colors) => <DonutChart aria-label="Donut" data={slices} index="name" category="value" colors={colors} />,
  ],
  ['SankeyChart', (colors) => <SankeyChart aria-label="Sankey" nodes={nodes} links={flows} colors={colors} />],
];

// Every paint a chart emits, in document order, as `var(...)` references and inline style values.
const paints = (container: HTMLElement) => container.innerHTML.match(/hsl\(var\([^;"]*?\)\)/g) ?? [];
const seriesRefs = (container: HTMLElement) =>
  [...new Set(paints(container).filter((value) => value.includes('--chart-series-')))].map(
    (value) => /--chart-series-(\d+)/.exec(value)![1],
  );

describe.each(charts)('%s series colours', (name, chart) => {
  it('draws --chart-series-1..7 when colors is omitted, falling back to the default accent tokens', () => {
    const { container } = render(chart());
    const refs = seriesRefs(container);
    for (const n of ['1', '2', '3', '4', '5', '6', '7']) expect(refs, `${name} series ${n}`).toContain(n);
    // Each reference carries today's token as its fallback, so palettes without series look unchanged.
    expect(container.innerHTML).toContain('hsl(var(--chart-series-1, var(--primary)))');
    expect(container.innerHTML).toContain('hsl(var(--chart-series-2, var(--category-violet)))');
    expect(container.innerHTML).toContain('hsl(var(--chart-series-3, var(--category-cyan)))');
    expect(container.innerHTML).toContain('hsl(var(--chart-series-4, var(--category-rose)))');
    expect(container.innerHTML).toContain('hsl(var(--chart-series-5, var(--category-amber)))');
    expect(container.innerHTML).toContain('hsl(var(--chart-series-6, var(--primary)))');
    expect(container.innerHTML).toContain('hsl(var(--chart-series-7, var(--category-violet)))');
  });

  it('keeps explicit colors exactly as given and never references a chart series', () => {
    const { container } = render(chart(['rose', 'amber']));
    expect(container.innerHTML).not.toContain('--chart-series');
    const used = paints(container).filter((value) => /category-(rose|amber)/.test(value));
    expect(used.length).toBeGreaterThan(0);
    expect(used[0]).toBe('hsl(var(--category-rose))');
    expect(used.find((value) => value.includes('amber'))).toBe('hsl(var(--category-amber))');
  });
});

it('Sankey node.color still wins over the series default', () => {
  const coloured = nodes.map((node, i) => (i === 0 ? { ...node, color: 'violet' as const } : node));
  const { container } = render(<SankeyChart aria-label="Sankey" nodes={coloured} links={flows} />);
  expect(container.innerHTML).toContain('hsl(var(--category-violet))');
  expect(container.innerHTML).not.toContain('hsl(var(--chart-series-1,');
  expect(container.innerHTML).toContain('hsl(var(--chart-series-2, var(--category-violet)))');
});

describe('series on the chart theme', () => {
  it("maps series i to --chart-series-(i+1) over today's token, wrapping after twelve", () => {
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.series(0)).toBe('hsl(var(--chart-series-1, var(--primary)))');
    expect(result.current.series(4)).toBe('hsl(var(--chart-series-5, var(--category-amber)))');
    expect(result.current.series(11)).toBe('hsl(var(--chart-series-12, var(--category-violet)))');
    expect(result.current.series(12)).toBe('hsl(var(--chart-series-1, var(--category-cyan)))');
    expect(result.current.series(1, 0.5)).toBe('hsl(var(--chart-series-2, var(--category-violet)) / 0.5)');
  });

  it('seriesColor uses the series only when no colors are given', () => {
    const { result } = renderHook(() => useChartTheme());
    expect(seriesColor(result.current, undefined, 2)).toBe('hsl(var(--chart-series-3, var(--category-cyan)))');
    expect(seriesColor(result.current, CHART_COLORS, 2)).toBe('hsl(var(--category-cyan))');
    expect(seriesColor(result.current, ['rose'], 2)).toBe('hsl(var(--category-rose))');
  });

  describe('resolved colours', () => {
    const set = (vars: Record<string, string>) => {
      document.documentElement.removeAttribute('style');
      for (const [key, value] of Object.entries(vars)) document.documentElement.style.setProperty(key, value);
    };

    it('read the series token when the palette defines it', () => {
      set({ '--primary': '145 61% 50%', '--chart-series-1': '218.9 100% 18%' });
      const { result } = renderHook(() => useChartTheme({ resolved: true }));
      expect(result.current.series(0)).toBe('hsl(218.9 100% 18%)');
    });

    it("fall back to today's token, never an empty colour, when the series is undefined", async () => {
      set({ '--primary': '145 61% 50%', '--category-violet': '262 62% 55%' });
      const { result } = renderHook(() => useChartTheme({ resolved: true }));
      expect(result.current.series(0)).toBe('hsl(145 61% 50%)');
      expect(result.current.series(1, 0.4)).toBe('hsl(262 62% 55% / 0.4)');
      act(() => {
        set({ '--primary': '145 61% 50%', '--chart-series-1': '218.9 100% 18%' });
        document.documentElement.dataset.palette = 'corporate';
      });
      await waitFor(() => expect(result.current.series(0)).toBe('hsl(218.9 100% 18%)'));
      document.documentElement.removeAttribute('data-palette');
    });
  });
});
