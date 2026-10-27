import { tokenColor } from '@gntik-ai/tokens/runtime';

const SVG_NS = 'http://www.w3.org/2000/svg';

function resolveColours(value: string, figure: HTMLElement): string {
  const resolved = value
    .replace(/hsla?\(\s*var\((--[\w-]+)\)\s*(?:\/\s*([\d.]+%?))?\s*\)/g, (_, token: string, alpha?: string) =>
      tokenColor(token, alpha === undefined ? undefined : parseFloat(alpha) / (alpha.endsWith('%') ? 100 : 1), figure),
    )
    .replace(/var\((--[\w-]+)\)/g, (_, token: string) => tokenColor(token, undefined, figure));
  if (resolved.includes('var(')) throw new Error('Unsupported chart colour expression');
  return resolved;
}

/** Clone only the plot; the live chart and its optional legend/table are untouched. */
function snapshot(figure: HTMLElement | null) {
  const surface = figure?.querySelector<SVGSVGElement>('svg.recharts-surface');
  if (!figure || figure.querySelector('[data-chart-state]') || !surface)
    throw new Error('A ready SVG chart is required');
  const bounds = surface.getBoundingClientRect();
  const width = Number(surface.getAttribute('width')) || bounds.width;
  const height = Number(surface.getAttribute('height')) || bounds.height;
  if (!(width > 0 && height > 0)) throw new Error('The chart plot has no size');
  const svg = surface.cloneNode(true) as SVGSVGElement;
  svg.removeAttribute('xmlns');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('font-family', getComputedStyle(figure).fontFamily || 'system-ui, sans-serif');
  svg.setAttribute('color', tokenColor('--foreground', undefined, figure));
  for (const node of [svg, ...svg.querySelectorAll('*')]) {
    for (const attr of ['fill', 'stroke', 'stop-color', 'color', 'style']) {
      const value = node.getAttribute(attr);
      if (value) node.setAttribute(attr, resolveColours(value, figure));
    }
  }
  const background = document.createElementNS(SVG_NS, 'rect');
  const viewBox = svg
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  background.setAttribute('x', String(viewBox?.[0] ?? 0));
  background.setAttribute('y', String(viewBox?.[1] ?? 0));
  background.setAttribute('width', String(viewBox?.[2] ?? width));
  background.setAttribute('height', String(viewBox?.[3] ?? height));
  background.setAttribute('fill', tokenColor('--card', undefined, figure));
  svg.prepend(background);
  return { blob: new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }), width, height };
}

/** Export the active theme's plot. Rejects missing, non-ready and HTML-only charts. */
export async function exportChartSvg(figure: HTMLElement | null): Promise<Blob> {
  return snapshot(figure).blob;
}

/** Data-table order, with the exact audit-log CSV escaping rule. Missing tables return empty. */
export function chartTableToCsv(table: HTMLTableElement | null): string {
  // openspec/changes/fix-audit-log-csv-formula-injection/specs/templates/audit-log/spec.md
  const cell = (value: string) => {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return /[,"\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return table
    ? Array.from(table.rows, (row) => Array.from(row.cells, (c) => cell(c.textContent ?? '')).join(',')).join('\n')
    : '';
}

export interface ChartPngOptions {
  /** Pixel ratio; defaults to 2. Must be finite and greater than zero. */
  scale?: number;
}

/** Rasterise a resolved SVG using an image blob URL (requires CSP img-src blob:). */
export async function exportChartPng(figure: HTMLElement | null, { scale = 2 }: ChartPngOptions = {}): Promise<Blob> {
  if (!Number.isFinite(scale) || scale <= 0) throw new Error('Chart scale must be finite and positive');
  const { blob, width, height } = snapshot(figure);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The chart image could not be loaded'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('PNG export failed'))), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Script-free about:blank iframe containing only an SVG image. Invalid charts are a no-op. */
export function printChart(figure: HTMLElement | null): void {
  let image: ReturnType<typeof snapshot>;
  try {
    image = snapshot(figure);
  } catch {
    return;
  }
  const url = URL.createObjectURL(image.blob);
  const frame = document.createElement('iframe');
  frame.title = figure?.getAttribute('aria-label') ?? '';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.position = 'fixed';
  frame.style.left = '-10000px';
  frame.style.width = `${image.width}px`;
  frame.style.height = `${image.height}px`;
  document.body.append(frame);
  const cleanup = () => {
    frame.remove();
    URL.revokeObjectURL(url);
    clearTimeout(fallback);
  };
  // Also release resources if the browser never dispatches afterprint (or image loading stalls).
  const fallback = setTimeout(cleanup, 300_000);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    cleanup();
    return;
  }
  win.addEventListener('afterprint', cleanup, { once: true });
  const img = doc.createElement('img');
  img.alt = frame.title;
  img.width = image.width;
  img.height = image.height;
  img.addEventListener('error', cleanup, { once: true });
  img.addEventListener(
    'load',
    () => {
      try {
        win.focus();
        win.print();
      } catch {
        cleanup();
      }
    },
    { once: true },
  );
  img.src = url;
  doc.body.style.margin = '0';
  doc.body.append(img);
}
