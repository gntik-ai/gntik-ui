## Purpose

Shared chart behaviour in @gntik-ai/charts: opt-in image, print and formula-safe data exports from the existing figure and table.

## ADDED Requirements

### Requirement: Image export resolves token colours

SVG and PNG chart exports SHALL contain a deep clone of the Recharts surface with every token colour in fill, stroke, stop-color, color and inline style resolved against the figure's current theme scope, including alpha values. The live DOM SHALL remain unchanged. The first painted element SHALL be a rect filled with the card token. The font-family stack SHALL be inlined.

#### Scenario: SVG in a document

- **WHEN** exportChartSvg exports a ready BarChart in the light theme
- **THEN** it returns an image/svg+xml Blob without unresolved colour variables
- **AND** the bars use the figure's primary token and the background uses its card token

#### Scenario: Nested theme scope

- **WHEN** a chart is inside a ThemeScope different from html
- **THEN** exported colours match the figure's scope rather than the root theme

### Requirement: PNG export scales the plot

exportChartPng SHALL serialise the resolved SVG to a blob URL, load it as an image, draw it on a canvas and return an image/png Blob through canvas.toBlob. The canvas dimensions SHALL equal the plot dimensions multiplied by scale, defaulting to 2. Object URLs SHALL be revoked after use, including errors. No foreignObject HTML or data-URL scripts SHALL be used.

#### Scenario: Default and explicit scale

- **WHEN** a chart is exported with the default scale
- **THEN** the PNG is twice the plot's pixel width and height
- **AND** an explicit scale of 1 produces the plot's original dimensions

### Requirement: CSV export mirrors the data table and escapes formulas

CSV chart export SHALL contain headers and body rows in the chart data table's order. Per fix-audit-log-csv-formula-injection, each cell whose first character is =, +, -, @, tab (U+0009) or carriage return (U+000D) SHALL receive a single quote before CSV quoting. Whitespace SHALL NOT be trimmed and characters SHALL NOT be stripped. Safe cells SHALL be unchanged, quoted only for comma, double quote or newline, with inner quotes doubled. Rows SHALL be joined by newline and cells by comma.

#### Scenario: Formula in a category

- **WHEN** a category is =HYPERLINK("x")
- **THEN** its CSV cell is "'=HYPERLINK(""x"")"

#### Scenario: Safe and negative cells

- **WHEN** cells contain a=b, a leading space before =1, or -12
- **THEN** the first two remain unchanged and -12 receives an apostrophe
- **AND** a CR-led cell without commas, quotes or newlines remains unquoted after prefixing

### Requirement: Downloads use safe names and release resources

useChartExport SHALL expose ref, downloadPng, downloadSvg, downloadCsv and print. It SHALL derive a safe slug from the figure aria-label, with a chart fallback and the corresponding png, svg or csv extension. Filenames SHALL contain no path separators or control characters. Download links and object URLs SHALL be cleaned up.

#### Scenario: Accessible name contains a path

- **WHEN** a chart name contains path separators or controls
- **THEN** the downloaded filename contains only a safe slug and its format extension

### Requirement: Exports work under strict content security policy

Chart exports and printing SHALL work with script-src 'self'; img-src 'self' blob: data: and SHALL NOT use eval, Function, inline scripts or inline event handlers. Print SHALL use a script-free hidden iframe containing only the resolved SVG image and remove it after afterprint.

#### Scenario: Locked-down console

- **WHEN** PNG, SVG and print are requested under that policy
- **THEN** they succeed without securitypolicyviolation events

### Requirement: Unavailable charts fail predictably

Image helpers SHALL reject missing, loading, empty, error and HTML-only plots. printChart SHALL no-op for those inputs. chartTableToCsv SHALL return empty for a missing table. Hook downloads SHALL reject missing figures or unavailable tables so callers can handle errors without uncaught exceptions.

#### Scenario: Loading chart

- **WHEN** an export is requested before the SVG chart is ready
- **THEN** image helpers reject and print is a no-op

### Requirement: Exports are documented accessible compositions

English and Spanish ChartLabels SHALL include export and print labels. A live docs example SHALL compose ChartCard and the kit Menu, use token classes, support keyboard operation and pass axe in dark, light and high_contrast. Documentation SHALL explain img-src blob:, scope capture, light-theme reports, PNG font fallback and negative-number CSV text semantics.

#### Scenario: Keyboard export

- **WHEN** a user opens the export Menu with the keyboard
- **THEN** arrow keys navigate and Enter activates a download, while Escape closes it and restores focus
