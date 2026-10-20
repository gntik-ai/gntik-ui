import { useState } from 'react';
import {
  BarChart,
  BarList,
  ChartBrush,
  ChartEmpty,
  ChartError,
  ChartLoading,
  ChartLocaleProvider,
  ChartMarkers,
  FunnelChart,
  Heatmap,
  MiniBar,
  SankeyChart,
  useChartLabels,
  type ChartRange,
} from '../index';

const data = [
  { month: 'Jan', Requests: 10 },
  { month: 'Feb', Requests: 6 },
  { month: 'Mar', Requests: 8 },
];
const common = { data, index: 'month', categories: ['Requests'], height: 160 } as const;
const slices = { data, index: 'month', category: 'Requests', height: 160 } as const;

function LocalisedContent() {
  const labels = useChartLabels();
  const [range, setRange] = useState<ChartRange>([0, 1]);
  return (
    <div className="grid gap-6">
      <p className="text-muted-foreground">Active loading label: {labels.loading}</p>
      <BarChart {...common} />
      <BarChart {...common} data={[]} />
      <BarChart {...common} state="loading" />
      <BarChart {...common} state="error" onRetry={() => {}} />
      <ChartBrush length={3} range={range} onRangeChange={setRange} labelOf={(i) => data[i]?.month ?? ''} />
      <ChartMarkers thresholds={[{ value: 8, label: 'Target' }]} annotations={[{ x: 'Feb', label: 'Release' }]} />
      <FunnelChart {...slices} dataTable />
      <SankeyChart
        nodes={[{ name: 'Input' }, { name: 'Output' }]}
        links={[{ source: 0, target: 1, value: 6 }]}
        height={160}
        dataTable
      />
      <Heatmap {...common} />
      <BarList {...slices} />
      <MiniBar data={[10, 6, 8]} />
      <ChartLocaleProvider locale="es" labels={{ empty: 'Nada que mostrar' }}>
        <ChartEmpty height={80} />
        <BarChart {...common} data={[]} emptyMessage="Explicit empty message" />
        <BarChart {...common} state="error" errorMessage="Explicit error message" />
        <BarChart {...common} title="Traffic" aria-label="Requests by month" />
        <ChartLoading label="Explicit loading label" height={80} />
        <ChartBrush length={3} range={range} onRangeChange={setRange} labelOf={String} label="Explicit range label" />
        <ChartEmpty height={80}>Custom empty content</ChartEmpty>
        <ChartError height={80}>Custom error content</ChartError>
      </ChartLocaleProvider>
    </div>
  );
}

/** A live example of the independent chart provider and explicit-prop precedence. */
export default function LocalizedCharts() {
  const [locale, setLocale] = useState('es');
  return (
    <div data-chart-i18n="" className="rounded-md border border-border bg-card p-5 text-foreground">
      <label className="mb-4 flex items-center gap-3">
        Chart language
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
          className="rounded-md border border-border bg-card px-2 py-1 text-foreground"
        >
          <option value="es">Spanish</option>
          <option value="en">English</option>
        </select>
      </label>
      <ChartLocaleProvider locale={locale}>
        <LocalisedContent />
      </ChartLocaleProvider>
    </div>
  );
}
