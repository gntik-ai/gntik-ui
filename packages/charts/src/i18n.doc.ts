/** Shared documentation for the strings-only chart locale API. */
export const doc = {
  name: 'ChartLocaleProvider',
  description:
    'Localises chart states, generated names, brush controls, markers and table headings. Standalone charts need ChartLocaleProvider in addition to the kit I18nProvider. ChartCard, CostBreakdown, SpendVsBudget and ConsoleShell bridge the kit locale automatically. Number/date formatting and caller-provided data labels are unchanged.',
  pattern:
    'Use locale="en" or locale="es" (language subtags such as es-MX also work); unknown locales and charts outside a provider use English. labels accepts per-key Partial<ChartLabels> overrides. Explicit emptyMessage, errorMessage, aria-label, title, brush/loading labels and state children take precedence. useChartLabels reads the nearest provider; chartLabelSets, en and es expose the built-ins. markerAt overrides retain the {x} placeholder. describeBars keeps its English default; MiniBar passes the localised bars label.',
  keyboard: [
    ['Brush handles', 'Arrow keys, PageUp/PageDown, Home/End adjust the selected range.'],
    ['Markers', 'Tab focuses annotations; Escape clears the highlight.'],
  ],
};
