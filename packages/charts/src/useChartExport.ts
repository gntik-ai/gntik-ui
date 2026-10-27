import { useRef, type RefObject } from 'react';
import { chartTableToCsv, exportChartPng, exportChartSvg, printChart, type ChartPngOptions } from './export';

export interface ChartExport {
  /** Attach to a div containing one chart (or to its figure element). */
  ref: RefObject<HTMLDivElement | null>;
  downloadPng: (options?: ChartPngOptions) => Promise<void>;
  downloadSvg: () => Promise<void>;
  downloadCsv: () => Promise<void>;
  print: () => void;
}

function download(blob: Blob, figure: HTMLElement, extension: string) {
  const name =
    (figure.getAttribute('aria-label') ?? 'chart')
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100) || 'chart';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.${extension}`;
  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** Opt-in exports; callers handle rejected downloads in their own UI. Print on invalid charts is a no-op. */
export function useChartExport(): ChartExport {
  const ref = useRef<HTMLDivElement>(null);
  const figure = () => {
    const element = ref.current;
    return element?.matches('[role="figure"]')
      ? element
      : (element?.querySelector<HTMLElement>('[role="figure"]') ?? null);
  };
  const required = () => {
    const found = figure();
    if (!found) throw new Error('A chart figure is required');
    return found;
  };
  return {
    ref,
    async downloadPng(options) {
      const el = required();
      download(await exportChartPng(el, options), el, 'png');
    },
    async downloadSvg() {
      const el = required();
      download(await exportChartSvg(el), el, 'svg');
    },
    async downloadCsv() {
      const el = required();
      const table = el.querySelector<HTMLTableElement>('table[data-chart-table]');
      if (!table || el.querySelector('[data-chart-state]')) throw new Error('A ready chart data table is required');
      download(new Blob([chartTableToCsv(table)], { type: 'text/csv;charset=utf-8' }), el, 'csv');
    },
    print() {
      printChart(figure());
    },
  };
}
