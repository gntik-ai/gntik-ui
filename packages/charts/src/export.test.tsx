import { render, screen, renderHook, act } from '@testing-library/react';
import { tokenColor } from '@gntik-ai/tokens/runtime';
import {
  BarChart,
  ChartDataTable,
  exportChartSvg,
  exportChartPng,
  chartTableToCsv,
  useChartExport,
  printChart,
} from './index';

const data = [{ month: 'Jan', requests: 12 }];
function chart() {
  render(<BarChart aria-label="Monthly requests" data={data} index="month" categories={['requests']} dataTable />);
  const figure = screen.getByRole<HTMLDivElement>('figure');
  // jsdom does not inherit custom properties, so install the active values on the figure.
  figure.style.setProperty('--primary', '145 61% 40%');
  figure.style.setProperty('--card', '145 12% 98%');
  figure.style.setProperty('--border', '145 12% 80%');
  figure.style.setProperty('--muted-foreground', '145 12% 40%');
  figure.style.fontFamily = 'system-ui, sans-serif';
  return figure;
}
function text(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}

it('exports a standalone, card-backed SVG without mutating the chart', async () => {
  const figure = chart();
  const original = figure.innerHTML;
  const blob = await exportChartSvg(figure);
  expect(blob.type).toBe('image/svg+xml');
  const svg = new DOMParser().parseFromString(await text(blob), 'image/svg+xml').documentElement;
  expect(svg.tagName).toBe('svg');
  expect(svg.outerHTML).not.toContain('var(');
  expect(svg.querySelector('.recharts-bar-rectangle path')?.getAttribute('fill')).toBe(
    tokenColor('--primary', undefined, figure),
  );
  expect(svg.firstElementChild?.tagName).toBe('rect');
  expect(svg.firstElementChild?.getAttribute('fill')).toBe(tokenColor('--card', undefined, figure));
  expect(svg.getAttribute('font-family')).toBe('system-ui, sans-serif');
  expect(svg.querySelector('[stroke]')?.getAttribute('stroke')).not.toContain('var(');
  expect(figure.innerHTML).toBe(original);
});

it('exports the table in order and applies the audit-log formula and quoting rules', () => {
  const cells = ['=HYPERLINK("x")', '+1', '-12', '@name', '\tvalue', '\rvalue', 'a=b', ' =1', 'a,b', 'a"b', 'a\nb'];
  render(<ChartDataTable caption="Data" columns={['category', 'value']} rows={cells.map((cell) => [cell, 4])} />);
  expect(chartTableToCsv(screen.getByRole('table'))).toBe(
    [
      'category,value',
      '"\'=HYPERLINK(""x"")",4',
      "'+1,4",
      "'-12,4",
      "'@name,4",
      "'\tvalue,4",
      "'\rvalue,4",
      'a=b,4',
      ' =1,4',
      '"a,b",4',
      '"a""b",4',
      '"a\nb",4',
    ].join('\n'),
  );
  expect(chartTableToCsv(null)).toBe('');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  [undefined, 1200, 600],
  [1, 600, 300],
] as const)('exports PNG with scale %s and releases its image URL', async (scale, width, height) => {
  const figure = chart();
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  const canvases: HTMLCanvasElement[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    this: HTMLCanvasElement,
    callback,
    type,
  ) {
    canvases.push(this);
    callback(new Blob(['image'], { type }));
  });
  vi.stubGlobal(
    'Image',
    class {
      onload: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
  const create = vi.fn(() => 'blob:chart');
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke });
  const blob = await exportChartPng(figure, { scale });
  expect(blob.type).toBe('image/png');
  // The test environment measures the plot at 600 × 300 pixels.
  expect(canvases[0]?.width).toBe(width);
  expect(canvases[0]?.height).toBe(height);
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, canvases[0]?.width, canvases[0]?.height);
  expect(revoke).toHaveBeenCalledWith('blob:chart');
});

it('downloads SVG and CSV using a safe accessible-name slug and revokes URLs', async () => {
  const figure = chart();
  figure.setAttribute('aria-label', '../Monthly / Requests\u0000 \\ Report');
  const { result } = renderHook(() => useChartExport());
  act(() => {
    result.current.ref.current = figure;
  });
  const names: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    names.push(this.download);
  });
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:download', revokeObjectURL: revoke });
  vi.useFakeTimers();
  try {
    await result.current.downloadSvg();
    await result.current.downloadCsv();
    expect(names).toEqual(['monthly-requests-report.svg', 'monthly-requests-report.csv']);
    await vi.runAllTimersAsync();
    expect(revoke).toHaveBeenCalledTimes(2);
    figure.querySelector('table')?.remove();
    await expect(result.current.downloadCsv()).rejects.toThrow(/table/i);
    act(() => {
      result.current.ref.current = null;
    });
    await expect(result.current.downloadSvg()).rejects.toThrow(/chart/i);
    expect(() => result.current.print()).not.toThrow();
  } finally {
    vi.useRealTimers();
  }
});

it('prints only a resolved image in a script-free iframe and cleans up after print', () => {
  const figure = chart();
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:print', revokeObjectURL: vi.fn() });
  printChart(figure);
  const frame = document.querySelector('iframe')!;
  expect(frame).not.toBeNull();
  const doc = frame.contentDocument!;
  expect(doc.querySelector('script, [onload], [onclick]')).toBeNull();
  const image = doc.querySelector('img')!;
  expect(image.getAttribute('src')).toBe('blob:print');
  const print = vi.spyOn(frame.contentWindow!, 'print').mockImplementation(() => {});
  vi.spyOn(frame.contentWindow!, 'focus').mockImplementation(() => {});
  image.dispatchEvent(new Event('load'));
  expect(print).toHaveBeenCalledOnce();
  frame.contentWindow!.dispatchEvent(new Event('afterprint'));
  expect(frame.isConnected).toBe(false);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:print');
});

it.each(['loading', 'empty', 'error'] as const)(
  'rejects images and safely ignores print for %s charts',
  async (state) => {
    render(
      <BarChart aria-label="Unavailable" state={state} data={data} index="month" categories={['requests']} dataTable />,
    );
    const figure = screen.getByRole<HTMLDivElement>('figure');
    await expect(exportChartSvg(figure)).rejects.toThrow(/ready SVG chart/i);
    await expect(exportChartPng(figure)).rejects.toThrow(/ready SVG chart/i);
    expect(() => printChart(figure)).not.toThrow();
    expect(chartTableToCsv(figure.querySelector('table'))).toBe('');
  },
);

it('rejects missing or HTML-only plots and invalid PNG scales', async () => {
  await expect(exportChartSvg(null)).rejects.toThrow(/chart/i);
  await expect(exportChartPng(document.createElement('div'))).rejects.toThrow(/chart/i);
  expect(() => printChart(null)).not.toThrow();
  const figure = chart();
  for (const scale of [0, -1, NaN, Infinity]) await expect(exportChartPng(figure, { scale })).rejects.toThrow(/scale/i);
});

it('resolves alpha, stop-colour, colour and inline style tokens against the figure', async () => {
  const figure = chart();
  document.documentElement.style.setProperty('--primary', '145 61% 50%');
  const source = figure.querySelector('svg.recharts-surface')!;
  const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop.setAttribute('stop-color', 'hsl(var(--primary) / 25%)');
  stop.setAttribute('color', 'var(--primary)');
  stop.setAttribute('style', 'fill: hsl(var(--primary)); stroke: hsl(var(--primary) / 0.5)');
  source.append(stop);
  const svg = new DOMParser().parseFromString(await text(await exportChartSvg(figure)), 'image/svg+xml');
  expect(svg.querySelector('stop')?.getAttribute('stop-color')).toBe(tokenColor('--primary', 0.25, figure));
  expect(svg.querySelector('stop')?.getAttribute('color')).toBe(tokenColor('--primary', undefined, figure));
  expect(svg.querySelector('stop')?.getAttribute('style')).not.toContain('var(');
  expect(svg.querySelector('stop')?.getAttribute('style')).toContain(tokenColor('--primary', 0.5, figure));
  document.documentElement.style.removeProperty('--primary');
});

it('releases the SVG URL when PNG image loading fails', async () => {
  const figure = chart();
  vi.stubGlobal(
    'Image',
    class {
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    },
  );
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:failed', revokeObjectURL: revoke });
  await expect(exportChartPng(figure)).rejects.toThrow(/loaded/i);
  expect(revoke).toHaveBeenCalledWith('blob:failed');
});
