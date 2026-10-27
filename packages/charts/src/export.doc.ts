/** Shared documentation for the optional chart export APIs. */
export const doc = {
  name: 'Chart export',
  description:
    'Export a ready Recharts plot as SVG or PNG, print it, or download its data table as formula-safe CSV. Compose useChartExport with the kit Menu in a ChartCard action; no menu is built into charts.',
  pattern:
    'Attach useChartExport().ref to a div containing one chart. downloadPng({ scale: 1 }) exports at 1x; the default is 2x. downloadSvg() and downloadCsv() derive safe filenames from the figure aria-label. print() uses a script-free hidden about:blank iframe containing only an SVG image, removed after afterprint (with a five-minute cleanup fallback). The standalone helpers are exportChartSvg(figure), exportChartPng(figure, { scale? }), chartTableToCsv(table) and printChart(figure). Image helpers reject missing, loading, empty, error and HTML-only charts (Heatmap, BarList); print is a no-op. CSV needs dataTable enabled; a missing table returns an empty string from chartTableToCsv and rejects downloadCsv. Catch rejected downloads in the caller. Exports capture the active ThemeScope, not the root theme. Prefer the light theme for reports. Include img-src blob: in your CSP; script-src self needs no inline scripts or eval. Only the font-family stack is inlined; PNG fonts may fall back to system fonts. CSV prefixes =, +, -, @, tab and CR with an apostrophe before quoting, including negative numbers, which spreadsheets read as text.',
  keyboard: [
    ['Menu trigger', 'Enter, Space or ArrowDown opens the export menu.'],
    ['Menu items', 'Arrow keys move; Enter or Space exports or prints; Escape closes the menu.'],
  ],
};
