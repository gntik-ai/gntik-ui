import { fireEvent, render, screen } from '@testing-library/react';
import {
  AreaChart,
  ChartError,
  ChartLoading,
  DonutChart,
  FunnelChart,
  Heatmap,
  MiniBar,
  RadarChart,
  SankeyChart,
  funnelStages,
  resolveSankeyLinks,
} from './index';

const funnel = [
  { stage: 'Visited', users: 1000 },
  { stage: 'Signed up', users: 400 },
  { stage: 'Activated', users: 300 },
  { stage: 'Paid', users: 90 },
];
const scores = [
  { axis: 'Latency', alpha: 80, beta: 60 },
  { axis: 'Throughput', alpha: 70, beta: 90 },
  { axis: 'Cost', alpha: 50, beta: 75 },
  { axis: 'Reliability', alpha: 95, beta: 70 },
];
const cohorts = [
  { cohort: 'Jan', w1: 100, w2: 62, w3: 48 },
  { cohort: 'Feb', w1: 100, w2: 58, w3: null },
];
const nodes = [{ name: 'Visits' }, { name: 'Docs' }, { name: 'Pricing' }, { name: 'Sign-up' }];
const links = [
  { source: 'Visits', target: 'Docs', value: 60 },
  { source: 'Visits', target: 'Pricing', value: 40 },
  { source: 'Docs', target: 'Sign-up', value: 20 },
  { source: 2, target: 3, value: 15 },
];

describe('FunnelChart', () => {
  it('computes conversion and drop-off per stage', () => {
    const s = funnelStages(funnel.map((f) => ({ name: f.stage, value: f.users })));
    expect(s.map((x) => x.conversion)).toEqual([1, 0.4, 0.3, 0.09]);
    expect(s[1]?.dropOff).toBeCloseTo(0.6);
    expect(s[3]?.dropOff).toBeCloseTo(0.7);
    expect(s[0]?.dropOff).toBe(0);
  });

  it('renders an accessible figure with the stage list and a table fallback', () => {
    const { container } = render(
      <FunnelChart aria-label="Sign-up funnel" data={funnel} index="stage" category="users" dataTable />,
    );
    expect(screen.getByRole('figure', { name: 'Sign-up funnel' })).toBeInTheDocument();
    const stages = screen.getByRole('list', { name: 'Stages' }).querySelectorAll('li');
    expect(stages).toHaveLength(4);
    expect(stages[1]).toHaveTextContent('40%');
    expect(stages[1]).toHaveTextContent('drop-off −60%');
    expect(screen.getByRole('table', { name: 'Sign-up funnel' })).toBeInTheDocument();
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull();
  });
});

describe('RadarChart', () => {
  it('renders polygons with a focusable surface and a toggling legend', () => {
    const { container } = render(
      <RadarChart title="Model scores" data={scores} index="axis" categories={['alpha', 'beta']} max={100} />,
    );
    expect(screen.getByRole('figure', { name: 'Model scores' })).toBeInTheDocument();
    expect(container.querySelector('svg.recharts-surface')).toHaveAttribute('tabindex', '0');
    const beta = screen.getByRole('button', { name: 'beta' });
    fireEvent.click(beta);
    expect(beta).toHaveAttribute('aria-pressed', 'false');
  });

  it('generates a name from the categories', () => {
    render(<RadarChart data={scores} index="axis" categories={['alpha', 'beta']} />);
    expect(screen.getByRole('figure', { name: 'Radar chart: alpha, beta' })).toBeInTheDocument();
  });
});

describe('SankeyChart', () => {
  it('resolves name and index links, dropping invalid ones', () => {
    const r = resolveSankeyLinks(nodes, [
      ...links,
      { source: 'Nope', target: 'Docs', value: 3 },
      { source: 0, target: 1, value: 0 },
    ]);
    expect(r).toEqual([
      { source: 0, target: 1, value: 60 },
      { source: 0, target: 2, value: 40 },
      { source: 1, target: 3, value: 20 },
      { source: 2, target: 3, value: 15 },
    ]);
  });

  it('renders flows with a data table fallback', () => {
    render(<SankeyChart aria-label="Visitor flow" nodes={nodes} links={links} dataTable />);
    expect(screen.getByRole('figure', { name: 'Visitor flow' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Visitor flow' });
    expect(table.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(table).toHaveTextContent('Docs');
  });
});

describe('Heatmap', () => {
  it('colours cells from the sequential ramp and exposes a table by default', () => {
    const { container } = render(
      <Heatmap aria-label="Retention" data={cohorts} index="cohort" categories={['w1', 'w2', 'w3']} />,
    );
    expect(screen.getByRole('figure', { name: 'Retention' })).toBeInTheDocument();
    expect(container.querySelector('[data-cell="0-0"]')).toHaveAttribute('data-fill', 'hsl(var(--primary))');
    expect(container.querySelector('[data-cell="1-1"]')?.getAttribute('data-fill')).toContain(
      'color-mix(in oklab, hsl(var(--primary))',
    );
    expect(container.querySelector('[data-cell="1-2"]')).not.toHaveAttribute('data-fill');
    const table = screen.getByRole('table', { name: 'Retention' });
    expect(table).toHaveTextContent('—');
  });

  it('is one keyboard stop; arrow keys move a live readout', () => {
    const { container } = render(
      <Heatmap
        aria-label="Retention"
        data={cohorts}
        index="cohort"
        categories={['w1', 'w2', 'w3']}
        valueFormatter={(v) => `${v}%`}
      />,
    );
    const grid = screen.getByRole('group', { name: /Retention: colour grid/ });
    const readout = container.querySelector('[data-heatmap-readout]');
    fireEvent.focus(grid);
    expect(readout).toHaveTextContent('Jan · w1: 100%');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(readout).toHaveTextContent('Feb · w2: 58%');
    fireEvent.keyDown(grid, { key: 'End' });
    expect(readout).toHaveTextContent('Feb · w3: no data');
    fireEvent.keyDown(grid, { key: 'Escape' });
    expect(readout).toBeEmptyDOMElement();
  });

  it('supports a diverging scale around zero', () => {
    const deltas = [{ team: 'A', q1: -20, q2: 0, q3: 30 }];
    const { container } = render(
      <Heatmap aria-label="Deltas" scale="diverging" steps={5} data={deltas} index="team" categories={['q1', 'q2', 'q3']} />,
    );
    expect(container.querySelector('[data-cell="0-0"]')).toHaveAttribute('data-fill', 'hsl(var(--destructive))');
    expect(container.querySelector('[data-cell="0-1"]')).toHaveAttribute('data-fill', 'hsl(var(--muted))');
    expect(container.querySelector('[data-cell="0-2"]')).toHaveAttribute('data-fill', 'hsl(var(--primary))');
  });
});

describe('MiniBar', () => {
  it('is an image with a generated summary and a highlighted last bar', () => {
    const { container } = render(<MiniBar data={[2, 5, 3, 9]} label="Deployments" />);
    expect(
      screen.getByRole('img', {
        name: 'Deployments: 4 bars, latest 9, low 2, high 9, total 19',
      }),
    ).toBeInTheDocument();
    const bars = container.querySelectorAll('rect');
    expect(bars).toHaveLength(4);
    expect(bars[3]).toHaveAttribute('data-highlight', 'true');
    expect(bars[3]).toHaveAttribute('fill', 'hsl(var(--primary))');
    expect(bars[0]).toHaveAttribute('fill', 'hsl(var(--primary) / 0.4)');
    expect(bars[0]?.querySelector('title')).toHaveTextContent('#1: 2');
  });

  it('handles negative values and empty data', () => {
    const { container, rerender } = render(<MiniBar data={[-3, 4]} tone="destructive" highlight="none" />);
    const [neg, pos] = Array.from(container.querySelectorAll('rect'));
    expect(Number(neg?.getAttribute('y'))).toBeGreaterThanOrEqual(Number(pos?.getAttribute('y')));
    rerender(<MiniBar data={[]} label="Builds" />);
    expect(screen.getByRole('img', { name: 'Builds: no data' })).toBeInTheDocument();
  });
});

describe('chart states', () => {
  const series = [{ m: 'Jan', v: 1 }];
  it.each([
    [
      'AreaChart',
      (s: 'loading' | 'empty' | 'error') => (
        <AreaChart aria-label="X" state={s} data={series} index="m" categories={['v']} onRetry={() => {}} />
      ),
    ],
    [
      'DonutChart',
      (s: 'loading' | 'empty' | 'error') => (
        <DonutChart aria-label="X" state={s} data={series} index="m" category="v" onRetry={() => {}} />
      ),
    ],
    [
      'FunnelChart',
      (s: 'loading' | 'empty' | 'error') => (
        <FunnelChart aria-label="X" state={s} data={series} index="m" category="v" onRetry={() => {}} />
      ),
    ],
    [
      'RadarChart',
      (s: 'loading' | 'empty' | 'error') => (
        <RadarChart aria-label="X" state={s} data={series} index="m" categories={['v']} onRetry={() => {}} />
      ),
    ],
    [
      'SankeyChart',
      (s: 'loading' | 'empty' | 'error') => (
        <SankeyChart aria-label="X" state={s} nodes={nodes} links={links} onRetry={() => {}} />
      ),
    ],
    [
      'Heatmap',
      (s: 'loading' | 'empty' | 'error') => (
        <Heatmap aria-label="X" state={s} data={series} index="m" categories={['v']} onRetry={() => {}} />
      ),
    ],
  ])('%s renders loading, empty and error placeholders', (_, ui) => {
    const { rerender, container } = render(ui('loading'));
    expect(screen.getByRole('figure', { name: 'X' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: 'Loading chart' })).toBeInTheDocument();
    rerender(ui('empty'));
    expect(container.querySelector('[data-chart-state="empty"]')).toHaveTextContent('No data for this period');
    rerender(ui('error'));
    expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(container.querySelector('svg.recharts-surface')).toBeNull();
  });

  it('treats ready-with-no-rows as empty, with a custom message', () => {
    render(
      <AreaChart
        aria-label="X"
        data={[] as { m: string; v: number }[]}
        index="m"
        categories={['v']}
        emptyMessage="No deployments yet"
      />,
    );
    expect(screen.getByText('No deployments yet')).toBeInTheDocument();
  });

  it('ChartError calls onRetry; ChartLoading stops pulsing under reduced motion', () => {
    const retry = vi.fn();
    render(<ChartError onRetry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    const { container } = render(<ChartLoading />);
    expect(container.querySelector('.animate-pulse')).toHaveClass('motion-reduce:animate-none');
  });

  it('cartesian charts can render a visually hidden data table', () => {
    render(
      <AreaChart
        aria-label="Requests"
        data={[{ m: 'Jan', v: 1200 }]}
        index="m"
        categories={['v']}
        dataTable
        valueFormatter={(v) => `${v} req`}
      />,
    );
    const table = screen.getByRole('table', { name: 'Requests' });
    expect(table).toHaveClass('sr-only');
    expect(table).toHaveTextContent('1200 req');
  });
});
