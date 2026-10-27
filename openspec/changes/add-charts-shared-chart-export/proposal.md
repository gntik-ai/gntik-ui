# Change: Add shared chart exports

## Why

Charts use theme-scoped CSS variables which lose their values outside the page. Consumers need optional image, print and data downloads without changing chart rendering or adding runtime dependencies.

## What Changes

- Add SVG and PNG helpers that clone the Recharts surface, resolve token colours against the figure, inline its font stack and prepend a card background. PNG defaults to a 2x canvas.
- Add CSV export from the existing data table with the exact audit-log formula protection rule.
- Add script-free iframe printing and useChartExport with safe accessible-name filenames and object URL cleanup.
- Add English and Spanish menu labels and a live kit Menu composition in the shared chart documentation.

## Impact

- Affected capability: charts/shared (all requirements ADDED; no baseline).
- Affected package: @gntik-ai/charts, additive minor release.
- Security: no eval, inline scripts, inline event handlers or foreignObject; image exports require img-src blob: under CSP.
- Print uses a hidden about:blank iframe holding only the resolved SVG image. It is removed after afterprint, with a five-minute cleanup fallback.
- CSV negative numbers receive an apostrophe and are interpreted as text by spreadsheets.
- Exports capture the current scope; light theme is recommended for reports. PNG fonts can fall back to system fonts.
- HTML-only image exports, Excel/PDF, server rendering and a built-in ChartCard menu are out of scope.
- Rollback: revert the additive change or pin the preceding charts minor. No deployment or publication is part of this change.
