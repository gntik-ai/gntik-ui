import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import {
  AreaChart,
  BarChart,
  BarList,
  CHART_COLORS,
  ChartTooltip,
  ComboChart,
  DonutChart,
  LineChart,
  chartFmt,
  useChartTheme,
} from './index';

interface Point {
  month: string;
  requests: number;
  errors: number;
}

const data: Point[] = [
  { month: 'Jan', requests: 1200, errors: 30 },
  { month: 'Feb', requests: 1500, errors: 22 },
  { month: 'Mar', requests: 1350, errors: 41 },
];
const shares = [
  { name: 'Ingest', value: 40 },
  { name: 'Transform', value: 35 },
  { name: 'Publish', value: 25 },
];

function setTokens(vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v);
}

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  setTokens({ '--primary': '145 61% 50%', '--category-violet': '262 62% 55%', '--card': '0 0% 100%' });
});

describe('CHART_COLORS', () => {
  it('keeps the brand series order', () => {
    expect(CHART_COLORS).toEqual(['primary', 'violet', 'cyan', 'amber', 'rose']);
  });
});

describe('cartesian charts', () => {
  it.each([
    ['AreaChart', () => <AreaChart aria-label="Requests" data={data} index="month" categories={['requests', 'errors']} />],
    ['BarChart', () => <BarChart aria-label="Requests" data={data} index="month" categories={['requests', 'errors']} />],
    ['LineChart', () => <LineChart aria-label="Requests" data={data} index="month" categories={['requests', 'errors']} startEndOnly />],
    ['ComboChart', () => <ComboChart aria-label="Requests" data={data} index="month" barSeries="requests" lineSeries="errors" />],
  ])('%s renders an accessible figure with an SVG surface', (_, ui) => {
    const { container } = render(ui());
    expect(screen.getByRole('figure', { name: 'Requests' })).toBeInTheDocument();
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull();
  });

  it('falls back to the title, then to a generated name', () => {
    render(<BarChart title="Monthly load" data={data} index="month" categories={['requests']} layout="vertical" />);
    expect(screen.getByRole('figure', { name: 'Monthly load' })).toBeInTheDocument();
    render(<LineChart data={data} index="month" categories={['requests', 'errors']} />);
    expect(screen.getByRole('figure', { name: 'Line chart: requests, errors' })).toBeInTheDocument();
  });

  it('enables the Recharts accessibility layer (focusable chart surface)', () => {
    const { container } = render(<AreaChart aria-label="A" data={data} index="month" categories={['requests']} />);
    expect(container.querySelector('svg.recharts-surface')).toHaveAttribute('tabindex', '0');
  });

  it('legend buttons toggle series visibility', () => {
    render(<AreaChart aria-label="A" data={data} index="month" categories={['requests', 'errors']} />);
    const btn = screen.getByRole('button', { name: 'errors' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('DonutChart', () => {
  it('renders slices with token colours, a total and a toggling legend', () => {
    const { container } = render(
      <DonutChart aria-label="Stage share" data={shares} index="name" category="value" centerLabel="jobs" />,
    );
    expect(screen.getByRole('figure', { name: 'Stage share' })).toBeInTheDocument();
    const total = () => screen.getByText('jobs').previousElementSibling;
    expect(total()).toHaveTextContent('100');
    const sector = container.querySelector('.recharts-pie-sector path');
    expect(sector?.getAttribute('fill')).toBe('hsl(var(--primary))');
    fireEvent.click(screen.getByRole('button', { name: /Ingest/ }));
    expect(total()).toHaveTextContent('60');
  });
});

describe('BarList', () => {
  it('sorts rows descending and labels the list', () => {
    render(<BarList aria-label="Top stages" data={shares} index="name" category="value" />);
    const items = screen.getByRole('list', { name: 'Top stages' }).querySelectorAll('li');
    expect(items[0]).toHaveTextContent('Ingest');
    expect(items[2]).toHaveTextContent('Publish');
  });
});

describe('ChartTooltip', () => {
  it('renders formatted rows and nothing when inactive', () => {
    const { rerender, container } = render(
      <ChartTooltip active label="Jan" payload={[{ name: 'cost', value: 1234, color: 'red' }]} valueFormatter={chartFmt.usd} />,
    );
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('$1,234')).toBeInTheDocument();
    rerender(<ChartTooltip active={false} payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('useChartTheme (token adapter wiring)', () => {
  it('returns SSR-safe CSS-variable colours by default', () => {
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.color('primary')).toBe('hsl(var(--primary))');
    expect(result.current.color('violet', 0.5)).toBe('hsl(var(--category-violet) / 0.5)');
    expect(result.current.grid).toBe('hsl(var(--border))');
    expect(result.current.theme).toBe('light');
  });

  it('resolves colours from the live CSS variables on request', () => {
    const { result } = renderHook(() => useChartTheme({ resolved: true }));
    expect(result.current.color('primary')).toBe('hsl(145 61% 50%)');
    expect(result.current.color('violet', 0.5)).toBe('hsl(262 62% 55% / 0.5)');
  });

  it('re-reads tokens when the theme class changes', async () => {
    const { result } = renderHook(() => useChartTheme({ resolved: true }));
    act(() => {
      setTokens({ '--primary': '145 61% 40%' });
      document.documentElement.classList.add('dark');
    });
    await waitFor(() => expect(result.current.theme).toBe('dark'));
    expect(result.current.color('primary')).toBe('hsl(145 61% 40%)');
  });

  it('server-renders coloured legend swatches and hydrates without a mismatch', async () => {
    document.documentElement.classList.add('dark');
    const ui = <AreaChart aria-label="Requests" data={data} index="month" categories={['requests', 'errors']} />;
    const html = renderToString(ui);
    expect(html).toContain('background:hsl(var(--primary))');
    expect(html).toContain('background:hsl(var(--category-violet))');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await act(async () => hydrateRoot(container, ui));
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    const swatch = container.querySelector('button[aria-pressed] span[aria-hidden]');
    expect(swatch).toHaveStyle({ background: 'hsl(var(--primary))' });
    act(() => root.unmount());
    container.remove();
  });
});

describe('chartFmt', () => {
  it('formats common units', () => {
    expect(chartFmt.compact(12_500)).toBe('12.5K');
    expect(chartFmt.ms(1200)).toBe('1,200 ms');
    expect(chartFmt.pct(12)).toBe('12%');
  });
});
