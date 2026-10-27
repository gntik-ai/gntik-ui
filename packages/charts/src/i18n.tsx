import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** Strings rendered by charts; series names and number/date formatting belong to the caller. */
export interface ChartLabels {
  loading: string;
  empty: string;
  error: string;
  retry: string;
  zoomRange: string;
  rangeStart: string;
  rangeEnd: string;
  resetZoom: string;
  markers: string;
  threshold: string;
  /** Prefix with an `{x}` placeholder for the annotation's x value. */
  markerAt: string;
  stages: string;
  stage: string;
  conversion: string;
  dropOff: string;
  dropOffPrefix: string;
  from: string;
  to: string;
  value: string;
  barChart: string;
  lineChart: string;
  areaChart: string;
  comboChart: string;
  donutChart: string;
  pieChart: string;
  funnelChart: string;
  sankeyChart: string;
  heatmap: string;
  colourGrid: string;
  radarChart: string;
  barList: string;
  bars: string;
  exportChart: string;
  exportPng: string;
  exportSvg: string;
  exportCsv: string;
  printChart: string;
  exportError: string;
}

export const en: Readonly<ChartLabels> = {
  loading: 'Loading chart',
  empty: 'No data for this period',
  error: 'The chart could not be loaded.',
  retry: 'Retry',
  zoomRange: 'Zoom range',
  rangeStart: 'Range start',
  rangeEnd: 'Range end',
  resetZoom: 'Reset zoom',
  markers: 'Chart markers',
  threshold: 'Threshold:',
  markerAt: 'Marker at {x}:',
  stages: 'Stages',
  stage: 'Stage',
  conversion: 'Conversion',
  dropOff: 'Drop-off',
  dropOffPrefix: 'drop-off ',
  from: 'From',
  to: 'To',
  value: 'Value',
  barChart: 'Bar chart',
  lineChart: 'Line chart',
  areaChart: 'Area chart',
  comboChart: 'Combo chart',
  donutChart: 'Donut chart',
  pieChart: 'Pie chart',
  funnelChart: 'Funnel chart',
  sankeyChart: 'Sankey chart',
  heatmap: 'Heatmap',
  colourGrid: 'colour grid, use the arrow keys to read cells',
  radarChart: 'Radar chart',
  barList: 'Bar list',
  bars: 'Bars',
  exportChart: 'Export chart',
  exportPng: 'Download PNG',
  exportSvg: 'Download SVG',
  exportCsv: 'Download CSV',
  printChart: 'Print chart',
  exportError: 'The chart could not be exported.',
};

export const es: Readonly<ChartLabels> = {
  loading: 'Cargando gráfico',
  empty: 'Sin datos para este periodo',
  error: 'No se pudo cargar el gráfico.',
  retry: 'Reintentar',
  zoomRange: 'Rango de zoom',
  rangeStart: 'Inicio del rango',
  rangeEnd: 'Fin del rango',
  resetZoom: 'Restablecer zoom',
  markers: 'Marcadores del gráfico',
  threshold: 'Umbral:',
  markerAt: 'Marcador en {x}:',
  stages: 'Etapas',
  stage: 'Etapa',
  conversion: 'Conversión',
  dropOff: 'Abandono',
  dropOffPrefix: 'abandono ',
  from: 'Origen',
  to: 'Destino',
  value: 'Valor',
  barChart: 'Gráfico de barras',
  lineChart: 'Gráfico de líneas',
  areaChart: 'Gráfico de áreas',
  comboChart: 'Gráfico combinado',
  donutChart: 'Gráfico de anillo',
  pieChart: 'Gráfico circular',
  funnelChart: 'Gráfico de embudo',
  sankeyChart: 'Diagrama de Sankey',
  heatmap: 'Mapa de calor',
  colourGrid: 'cuadrícula de colores, usa las flechas para leer las celdas',
  radarChart: 'Gráfico de radar',
  barList: 'Lista de barras',
  bars: 'Barras',
  exportChart: 'Exportar gráfico',
  exportPng: 'Descargar PNG',
  exportSvg: 'Descargar SVG',
  exportCsv: 'Descargar CSV',
  printChart: 'Imprimir gráfico',
  exportError: 'No se pudo exportar el gráfico.',
};

export const chartLabelSets = { en, es };
const ChartLabelsContext = createContext<Readonly<ChartLabels>>(en);

export interface ChartLocaleProviderProps {
  /** Language subtag selects en/es; unknown locales fall back to English. */
  locale?: string;
  /** Per-key overrides, after selecting the built-in language. Explicit chart props still win. */
  labels?: Partial<ChartLabels>;
  children?: ReactNode;
}

/** Strings-only locale provider for standalone charts, independent of @gntik-ai/ui. */
export function ChartLocaleProvider({ locale = 'en', labels, children }: ChartLocaleProviderProps) {
  const value = useMemo(() => {
    const language = locale.split(/[-_]/)[0]?.toLowerCase() ?? '';
    const builtIn = Object.hasOwn(chartLabelSets, language)
      ? chartLabelSets[language as keyof typeof chartLabelSets]
      : en;
    return { ...builtIn, ...labels };
  }, [locale, labels]);
  return <ChartLabelsContext.Provider value={value}>{children}</ChartLabelsContext.Provider>;
}

/** Active chart labels, or English outside a ChartLocaleProvider. */
export function useChartLabels(): Readonly<ChartLabels> {
  return useContext(ChartLabelsContext);
}
