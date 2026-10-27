# Tasks

## 1. Implementation

- [x] 1.1 Add and re-export SVG, PNG, CSV and print helpers and useChartExport, with token scope resolution and predictable unavailable-state handling.
- [x] 1.2 Add English and Spanish export labels and a ChartCard action composed with the kit Menu.

## 2. Tests

- [x] 2.1 Test the public export APIs: standalone SVG, alpha colours, PNG scale, CSV safety/order, filenames, cleanup and unavailable states.
- [x] 2.2 Add browser coverage for strict CSP, scoped colours, actual PNG dimensions, downloads, print routing, keyboard Menu interaction and axe in three themes.
- [ ] 2.3 Run the browser suite in PR CI (worker policy reserves browser suites for CI).

## 3. Docs and release

- [x] 3.1 Add shared API documentation and a live export example, including CSP, light-theme and CSV caveats.
- [x] 3.2 Add a minor @gntik-ai/charts changeset and regenerate registry artifacts.
- [x] 3.3 Run repository checks and openspec validate add-charts-shared-chart-export --strict where the tool is available. The tokens mirror-install integration check needs PR CI: without registry access its fallback expects a 0.2.1 tarball while the local package is 0.3.0.
