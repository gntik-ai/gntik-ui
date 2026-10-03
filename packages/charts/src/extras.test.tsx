import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { AreaChart, BarChart, ComboChart, LineChart, clampRange, useLiveSeries, usePrefersReducedMotion } from './index';
import BrushZoom from './examples/BrushZoom';
import LiveSeries from './examples/LiveSeries';
import ThresholdsAndAnnotations from './examples/ThresholdsAndAnnotations';
import { LATENCY_DAYS } from './examples/data';

const data = [
  { month: 'Jan', requests: 1200, errors: 30 },
  { month: 'Feb', requests: 1500, errors: 22 },
  { month: 'Mar', requests: 1350, errors: 41 },
  { month: 'Apr', requests: 1600, errors: 18 },
];
const thresholds = [{ value: 1400, label: 'Budget', tone: 'warning' as const }];
const annotations = [{ x: 'Feb', label: 'Deploy', description: 'Version 2 rolled out.', tone: 'primary' as const }];

describe('thresholds and annotations', () => {
  it.each([
    ['LineChart', () => <LineChart aria-label="C" data={data} index="month" categories={['requests']} thresholds={thresholds} annotations={annotations} />],
    ['AreaChart', () => <AreaChart aria-label="C" data={data} index="month" categories={['requests']} thresholds={thresholds} annotations={annotations} />],
    ['BarChart', () => <BarChart aria-label="C" data={data} index="month" categories={['requests']} thresholds={thresholds} annotations={annotations} />],
    ['BarChart vertical', () => <BarChart aria-label="C" layout="vertical" data={data} index="month" categories={['requests']} thresholds={thresholds} annotations={annotations} />],
    ['ComboChart', () => <ComboChart aria-label="C" data={data} index="month" barSeries="requests" lineSeries="errors" thresholds={thresholds} annotations={annotations} />],
  ])('%s draws labelled reference lines and lists them as text', (_, ui) => {
    const { container } = render(ui());
    // Not colour-only: a text label in the plot and a dashed stroke.
    expect(container.querySelector('[data-chart-threshold-label]')).toHaveTextContent('Budget');
    expect(container.querySelector('.recharts-reference-line line')).toHaveAttribute('stroke-dasharray', '6 4');
    expect(container.querySelector('[data-chart-annotation]')).toHaveTextContent('Deploy');
    const list = screen.getByRole('list', { name: 'Chart markers' });
    expect(within(list).getByText(/Threshold:/).parentElement).toHaveTextContent('Threshold: Budget (1400)');
    expect(within(list).getByRole('button', { name: 'Marker at Feb: Deploy' })).toHaveAccessibleDescription('Version 2 rolled out.');
  });

  it('opens the marker tooltip in the plot from the keyboard and closes it with Escape', () => {
    const { container } = render(<ThresholdsAndAnnotations />);
    const tip = () => container.querySelector('[data-chart-annotation-tooltip]');
    expect(tip()).toBeNull();
    const button = screen.getByRole('button', { name: /Incident/ });
    act(() => button.focus());
    expect(tip()).toHaveTextContent('Incident: Cache cluster failover');
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(tip()).toBeNull();
  });

  it('opens the tooltip on pointer hover over the marker', () => {
    const { container } = render(<ThresholdsAndAnnotations />);
    const marker = () => container.querySelector('[data-chart-annotation]')!;
    fireEvent.pointerEnter(marker());
    expect(container.querySelector('[data-chart-annotation-tooltip]')).toHaveTextContent('Deploy v2.4');
    fireEvent.pointerLeave(marker());
    expect(container.querySelector('[data-chart-annotation-tooltip]')).toBeNull();
  });

  it('formats threshold values and skips annotations outside the data', () => {
    render(
      <LineChart
        aria-label="C"
        data={data}
        index="month"
        categories={['requests']}
        valueFormatter={(n) => `${n} rps`}
        thresholds={thresholds}
        annotations={[{ x: 'Dec', label: 'Elsewhere' }]}
      />,
    );
    expect(screen.getByText('(1400 rps)')).toBeInTheDocument();
    expect(screen.queryByText('Elsewhere')).toBeNull();
  });
});

describe('brush', () => {
  it('renders two slider handles with values and text', () => {
    render(<BrushZoom />);
    const start = screen.getByRole('slider', { name: 'Range start' });
    const end = screen.getByRole('slider', { name: 'Range end' });
    expect(start).toHaveAttribute('aria-valuenow', '14');
    expect(start).toHaveAttribute('aria-valuetext', 'Sep 15');
    expect(start).toHaveAttribute('aria-valuemax', '26');
    expect(end).toHaveAttribute('aria-valuenow', '27');
    expect(end).toHaveAttribute('aria-valuemin', '15');
    expect(screen.getByRole('group', { name: 'Zoom range' })).toHaveTextContent('Sep 15 – Sep 28');
  });

  it('moves the handles from the keyboard and slices the plotted data', () => {
    const onRangeChange = vi.fn();
    render(<LineChart aria-label="C" data={LATENCY_DAYS} index="day" categories={['p95']} brush dataTable onRangeChange={onRangeChange} />);
    const start = screen.getByRole('slider', { name: 'Range start' });
    const end = screen.getByRole('slider', { name: 'Range end' });
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(onRangeChange).toHaveBeenLastCalledWith([1, 27]);
    fireEvent.keyDown(start, { key: 'PageUp' });
    expect(start).toHaveAttribute('aria-valuenow', '4');
    fireEvent.keyDown(end, { key: 'Home' });
    expect(end).toHaveAttribute('aria-valuenow', '5');
    fireEvent.keyDown(end, { key: 'ArrowLeft' });
    expect(end).toHaveAttribute('aria-valuenow', '5');
    // The fallback table lists only the brushed points.
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(1 + 2);
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(onRangeChange).toHaveBeenLastCalledWith([0, 27]);
    expect(within(table).getAllByRole('row')).toHaveLength(1 + 28);
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
  });

  it('follows a controlled range', () => {
    const { rerender } = render(<BarChart aria-label="C" data={data} index="month" categories={['requests']} brush range={[1, 2]} dataTable />);
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Range end' }), { key: 'End' });
    // Controlled: stays until the parent updates.
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
    rerender(<BarChart aria-label="C" data={data} index="month" categories={['requests']} brush range={[0, 3]} dataTable />);
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(5);
  });

  it('pans the window with the pointer', () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <AreaChart aria-label="C" data={LATENCY_DAYS} index="day" categories={['requests']} brush defaultRange={[0, 9]} onRangeChange={onRangeChange} />,
    );
    const win = container.querySelector('[data-brush-window]')!;
    // The jsdom setup reports a 600px-wide track: 27 steps → ~22px per point.
    fireEvent.pointerDown(win, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(win, { clientX: (600 / 27) * 3, pointerId: 1 });
    fireEvent.pointerUp(win, { pointerId: 1 });
    expect(onRangeChange).toHaveBeenLastCalledWith([3, 12]);
  });

  it('clampRange orders, clamps and keeps a minimum span', () => {
    expect(clampRange(null, 10)).toEqual([0, 9]);
    expect(clampRange([8, 2], 10)).toEqual([2, 8]);
    expect(clampRange([-4, 40], 10)).toEqual([0, 9]);
    expect(clampRange([9, 9], 10)).toEqual([8, 9]);
    expect(clampRange([0, 0], 1)).toEqual([0, 0]);
  });
});

describe('useLiveSeries', () => {
  it('keeps a sliding window', () => {
    const { result } = renderHook(() => useLiveSeries<number>({ initial: [1, 2, 3], windowSize: 3 }));
    act(() => result.current.append(4));
    expect(result.current.data).toEqual([2, 3, 4]);
    act(() => result.current.append([5, 6]));
    expect(result.current.data).toEqual([4, 5, 6]);
    act(() => result.current.reset([9]));
    expect(result.current.data).toEqual([9]);
  });

  it('freezes on hover and focus, buffers points and resumes', () => {
    const { result } = renderHook(() => useLiveSeries<number>({ initial: [1], windowSize: 5 }));
    act(() => result.current.pauseProps.onPointerEnter());
    expect(result.current.paused).toBe(true);
    act(() => result.current.append([2, 3]));
    expect(result.current.data).toEqual([1]);
    expect(result.current.pending).toBe(2);
    act(() => result.current.pauseProps.onFocus());
    act(() => result.current.pauseProps.onPointerLeave());
    expect(result.current.paused).toBe(true);
    const outside = document.createElement('button');
    act(() => result.current.pauseProps.onBlur({ currentTarget: document.createElement('div'), relatedTarget: outside } as never));
    expect(result.current.paused).toBe(false);
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.pending).toBe(0);
  });

  it('pauses manually (WCAG 2.2.2) and can ignore interaction', () => {
    const { result } = renderHook(() => useLiveSeries<number>({ initial: [1], pauseOnInteraction: false }));
    act(() => result.current.pauseProps.onPointerEnter());
    expect(result.current.paused).toBe(false);
    act(() => result.current.togglePaused());
    expect(result.current.manuallyPaused).toBe(true);
    act(() => result.current.append(2));
    expect(result.current.data).toEqual([1]);
    act(() => result.current.togglePaused());
    expect(result.current.data).toEqual([1, 2]);
  });

  it('reports reduced motion from the media query', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: query.includes('reduce'), media: query, addEventListener: () => {}, removeEventListener: () => {} })) as never;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
    window.matchMedia = original;
  });

  it('the live example appends on a timer and pauses while hovered', () => {
    vi.useFakeTimers();
    const { container } = render(<LiveSeries interval={1000} />);
    const rows = () => container.querySelectorAll('.recharts-line-curve').length;
    expect(rows()).toBe(1);
    const status = screen.getByText('Live');
    fireEvent.pointerEnter(container.firstElementChild!);
    expect(status).toHaveTextContent('Paused');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('· 3 new', { exact: false })).toBeInTheDocument();
    fireEvent.pointerLeave(container.firstElementChild!);
    expect(status).toHaveTextContent('Live');
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toHaveAttribute('aria-pressed', 'true');
    vi.useRealTimers();
  });
});
