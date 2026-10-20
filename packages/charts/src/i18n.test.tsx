import type { ReactElement } from 'react';
import { fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { catalogs } from '../../ui/src/i18n/messages';
import {
  AreaChart,
  BarChart,
  BarList,
  ChartBrush,
  ChartEmpty,
  ChartError,
  ChartLoading,
  ChartLocaleProvider,
  ChartMarkers,
  ComboChart,
  DonutChart,
  FunnelChart,
  Heatmap,
  LineChart,
  MiniBar,
  RadarChart,
  SankeyChart,
  chartLabelSets,
  describeBars,
  useChartLabels,
} from './index';

const data = [
  { month: 'Jan', Solicitudes: 10, Errores: 1 },
  { month: 'Feb', Solicitudes: 5, Errores: 2 },
];
const cartesian = { data, index: 'month', categories: ['Solicitudes'] } as const;
const slices = { data, index: 'month', category: 'Solicitudes' } as const;
const sankey = { nodes: [{ name: 'Jan' }, { name: 'Feb' }], links: [{ source: 0, target: 1, value: 5 }] };
const spanish = (child: ReactElement) => <ChartLocaleProvider locale="es">{child}</ChartLocaleProvider>;

it('localises empty, loading and error states and keeps the retry action usable', () => {
  const onRetry = vi.fn();
  const { rerender } = render(spanish(<BarChart {...cartesian} data={[]} />));
  expect(screen.getByText('Sin datos para este periodo')).toBeInTheDocument();
  rerender(spanish(<BarChart {...cartesian} state="loading" />));
  expect(screen.getByRole('status', { name: 'Cargando gráfico' })).toBeInTheDocument();
  rerender(spanish(<BarChart {...cartesian} state="error" onRetry={onRetry} />));
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el gráfico.');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(onRetry).toHaveBeenCalledOnce();
});

const kinds: Array<[string, string, ReactElement]> = [
  ['Gráfico de barras: Solicitudes', 'Bar chart: Solicitudes', <BarChart {...cartesian} />],
  ['Gráfico de líneas: Solicitudes', 'Line chart: Solicitudes', <LineChart {...cartesian} />],
  ['Gráfico de áreas: Solicitudes', 'Area chart: Solicitudes', <AreaChart {...cartesian} />],
  [
    'Gráfico combinado: Solicitudes, Errores',
    'Combo chart: Solicitudes, Errores',
    <ComboChart data={data} index="month" barSeries="Solicitudes" lineSeries="Errores" />,
  ],
  ['Gráfico de anillo: Jan, Feb', 'Donut chart: Jan, Feb', <DonutChart {...slices} />],
  ['Gráfico circular: Jan, Feb', 'Pie chart: Jan, Feb', <DonutChart {...slices} variant="pie" />],
  ['Gráfico de embudo: Jan, Feb', 'Funnel chart: Jan, Feb', <FunnelChart {...slices} />],
  ['Diagrama de Sankey: Jan, Feb', 'Sankey chart: Jan, Feb', <SankeyChart {...sankey} />],
  ['Mapa de calor', 'Heatmap', <Heatmap {...cartesian} />],
  ['Gráfico de radar: Solicitudes', 'Radar chart: Solicitudes', <RadarChart {...cartesian} />],
];

it.each(kinds)('generates the Spanish name %s', (name, _english, chart) => {
  render(spanish(chart));
  expect(screen.getByRole('figure', { name })).toBeInTheDocument();
});

it('preserves title and aria-label precedence', () => {
  const { rerender } = render(spanish(<BarChart {...cartesian} title="Tráfico" />));
  expect(screen.getByRole('figure', { name: 'Tráfico' })).toBeInTheDocument();
  rerender(spanish(<BarChart {...cartesian} title="Tráfico" aria-label="Custom chart" />));
  expect(screen.getByRole('figure', { name: 'Custom chart' })).toBeInTheDocument();
});

it('localises bar lists and MiniBar while describeBars keeps its English public API', () => {
  render(
    spanish(
      <>
        <BarList {...slices} />
        <MiniBar data={[10, 5]} />
      </>,
    ),
  );
  expect(screen.getByRole('list', { name: 'Lista de barras' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Barras: 2 bars, latest 5, low 5, high 10, total 15' })).toBeInTheDocument();
  expect(describeBars([10, 5])).toBe('Bars: 2 bars, latest 5, low 5, high 10, total 15');
  expect(describeBars([10, 5], 'Count', (n) => `${n}!`)).toBe('Count: 2 bars, latest 5!, low 5!, high 10!, total 15!');
});

it('localises brush controls and marker prefixes, retaining explicit brush labels', () => {
  const onRangeChange = vi.fn();
  const brush = (
    <ChartBrush
      length={3}
      range={[0, 1]}
      labelOf={(i) => ['Jan', 'Feb', 'Mar'][i] ?? ''}
      onRangeChange={onRangeChange}
    />
  );
  const { rerender } = render(
    spanish(
      <>
        {brush}
        <ChartMarkers thresholds={[{ value: 8, label: 'Limit' }]} annotations={[{ x: 'Feb', label: 'Release' }]} />
      </>,
    ),
  );
  const group = screen.getByRole('group', { name: 'Rango de zoom' });
  expect(within(group).getByRole('slider', { name: 'Inicio del rango' })).toBeInTheDocument();
  expect(within(group).getByRole('slider', { name: 'Fin del rango' })).toBeInTheDocument();
  fireEvent.click(within(group).getByRole('button', { name: 'Restablecer zoom' }));
  expect(onRangeChange).toHaveBeenCalledWith([0, 2]);
  const markers = screen.getByRole('list', { name: 'Marcadores del gráfico' });
  expect(markers).toHaveTextContent('Umbral: Limit (8)');
  expect(within(markers).getByRole('button', { name: 'Marcador en Feb: Release' })).toBeInTheDocument();
  rerender(
    spanish(
      <ChartBrush length={3} range={[0, 2]} labelOf={String} label="Custom range" onRangeChange={onRangeChange} />,
    ),
  );
  expect(screen.getByRole('group', { name: 'Custom range' })).toBeInTheDocument();
});

it('localises funnel stages, drop-off text and funnel and Sankey table headings', () => {
  render(
    spanish(
      <>
        <FunnelChart {...slices} dataTable />
        <SankeyChart {...sankey} dataTable />
      </>,
    ),
  );
  const stages = screen.getByRole('list', { name: 'Etapas' });
  expect(stages).toHaveTextContent('abandono');
  const funnel = screen.getByRole('table', { name: 'Gráfico de embudo: Jan, Feb' });
  expect(
    within(funnel)
      .getAllByRole('columnheader')
      .map((h) => h.textContent),
  ).toEqual(['Etapa', 'Solicitudes', 'Conversión', 'Abandono']);
  const flow = screen.getByRole('table', { name: 'Diagrama de Sankey: Jan, Feb' });
  expect(
    within(flow)
      .getAllByRole('columnheader')
      .map((h) => h.textContent),
  ).toEqual(['Origen', 'Destino', 'Valor']);
});

it('localises the heatmap keyboard instructions', () => {
  render(spanish(<Heatmap {...cartesian} />));
  expect(
    screen.getByRole('group', { name: 'Mapa de calor: cuadrícula de colores, usa las flechas para leer las celdas' }),
  ).toBeInTheDocument();
});

it('overrides labels per key, with explicit state props and children taking precedence', () => {
  const wrap = (child: ReactElement) => (
    <ChartLocaleProvider
      locale="es"
      labels={{ empty: 'Nada que mostrar', error: 'Label error', loading: 'Label loading' }}
    >
      {child}
    </ChartLocaleProvider>
  );
  const { rerender } = render(wrap(<BarChart {...cartesian} data={[]} />));
  expect(screen.getByText('Nada que mostrar')).toBeInTheDocument();
  rerender(wrap(<BarChart {...cartesian} data={[]} emptyMessage="Custom empty" />));
  expect(screen.getByText('Custom empty')).toBeInTheDocument();
  rerender(wrap(<BarChart {...cartesian} state="error" errorMessage="Custom error" onRetry={() => {}} />));
  expect(screen.getByRole('alert')).toHaveTextContent('Custom error');
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  rerender(
    wrap(
      <>
        <ChartEmpty>Child empty</ChartEmpty>
        <ChartError>Child error</ChartError>
        <ChartLoading label="Custom loading" />
      </>,
    ),
  );
  expect(screen.getByText('Child empty')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Child error');
  expect(screen.getByRole('status', { name: 'Custom loading' })).toBeInTheDocument();
  rerender(
    <ChartLocaleProvider locale="es" labels={{ empty: 'Nada que mostrar' }}>
      <ChartLoading />
      <ChartError onRetry={() => {}} />
    </ChartLocaleProvider>,
  );
  expect(screen.getByRole('status', { name: 'Cargando gráfico' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el gráfico.');
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
});

it.each(['es-MX', 'ES_mx'])('selects Spanish by language subtag for %s', (locale) => {
  render(
    <ChartLocaleProvider locale={locale}>
      <BarChart {...cartesian} data={[]} />
    </ChartLocaleProvider>,
  );
  expect(screen.getByText('Sin datos para este periodo')).toBeInTheDocument();
});

it.each(['unknown', 'constructor', undefined])('falls back to English for locale %s', (locale) => {
  render(
    <ChartLocaleProvider locale={locale}>
      <ChartEmpty />
      <ChartLoading />
      <ChartError onRetry={() => {}} />
    </ChartLocaleProvider>,
  );
  expect(screen.getByText('No data for this period')).toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Loading chart' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('The chart could not be loaded.');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
});

it.each(kinds)('preserves the English name without a provider for %s', (_spanish, english, chart) => {
  render(chart);
  expect(screen.getByRole('figure', { name: english })).toBeInTheDocument();
});

it('preserves English state, brush, marker, table and small-chart defaults without a provider', () => {
  render(
    <>
      <ChartEmpty />
      <ChartLoading />
      <ChartError onRetry={() => {}} />
      <ChartBrush length={3} range={[0, 1]} labelOf={String} onRangeChange={() => {}} />
      <ChartMarkers thresholds={[{ value: 8, label: 'Limit' }]} annotations={[{ x: 'Feb', label: 'Release' }]} />
      <FunnelChart {...slices} dataTable />
      <SankeyChart {...sankey} dataTable />
      <BarList {...slices} />
      <MiniBar data={[10, 5]} />
    </>,
  );
  expect(screen.getByText('No data for this period')).toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Loading chart' })).toHaveTextContent('Loading chart…');
  expect(screen.getByRole('alert')).toHaveTextContent('The chart could not be loaded.');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Zoom range' })).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: 'Range start' })).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: 'Range end' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'Chart markers' })).toHaveTextContent('Threshold: Limit (8)');
  expect(screen.getByRole('button', { name: 'Marker at Feb: Release' })).toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'Stages' })).toHaveTextContent('drop-off');
  expect(
    within(screen.getByRole('table', { name: 'Funnel chart: Jan, Feb' }))
      .getAllByRole('columnheader')
      .map((h) => h.textContent),
  ).toEqual(['Stage', 'Solicitudes', 'Conversion', 'Drop-off']);
  expect(
    within(screen.getByRole('table', { name: 'Sankey chart: Jan, Feb' }))
      .getAllByRole('columnheader')
      .map((h) => h.textContent),
  ).toEqual(['From', 'To', 'Value']);
  expect(screen.getByRole('list', { name: 'Bar list' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Bars: 2 bars, latest 5, low 5, high 10, total 15' })).toBeInTheDocument();
});

it('keeps label keys and built-in languages aligned with the kit catalog', () => {
  expect(Object.keys(chartLabelSets.es).sort()).toEqual(Object.keys(chartLabelSets.en).sort());
  expect(Object.keys(chartLabelSets).sort()).toEqual(Object.keys(catalogs).sort());
});

it('memoises labels across provider renders with unchanged inputs', () => {
  const labels = { empty: 'Custom empty' };
  const { result, rerender } = renderHook(() => useChartLabels(), {
    wrapper: ({ children }) => (
      <ChartLocaleProvider locale="es" labels={labels}>
        {children}
      </ChartLocaleProvider>
    ),
  });
  const first = result.current;
  rerender();
  expect(result.current).toBe(first);
});
