## Purpose

DownloadButton and its helpers: save strings, Blobs or async results as named files, and serialise rows to CSV with RFC 4180 quoting and spreadsheet formula escaping.

## ADDED Requirements

### Requirement: DownloadButton saves the data under the given file name and type

Activating DownloadButton SHALL save `data` as one file named `fileName` with `mimeType` (or the Blob's own type) and MUST release the object URL only after the download has started. The fallback MIME type SHALL be `text/plain;charset=utf-8`. The temporary anchor SHALL be removed after clicking and the object URL SHALL be revoked on the next task using setTimeout 0. onDownloaded SHALL fire once after a successful save. downloadFile SHALL do nothing without throwing when URL.createObjectURL is unavailable.

#### Scenario: String data

- **WHEN** the user clicks a DownloadButton with data `a,b`, file name `report.csv` and type `text/csv`
- **THEN** one Blob of type `text/csv` is created
- **AND** one anchor with `download` `report.csv` is clicked
- **AND** the object URL is revoked on a later task after the click

### Requirement: Async data getter shows a pending state and ignores repeats

While a `data` getter promise is pending, DownloadButton SHALL show Button's loading state with `aria-busy` and remain focusable, and MUST NOT call the getter again until it settles, including repeated activation before a re-render.

#### Scenario: Repeated clicks

- **GIVEN** `data` is a getter that resolves after 500 ms
- **WHEN** the user clicks the button four times within 100 ms
- **THEN** the getter is called once
- **AND** exactly one file is saved when it resolves
- **AND** the button returns to idle

### Requirement: Failed download is announced and reported

When the getter rejects, DownloadButton SHALL announce the `download.failed` message politely through LiveAnnouncer if present or its own status region otherwise, call `onDownloadError` with the error, save no file and return to its idle state with focus preserved. Every default visible or accessible string SHALL come from i18n, with English and Spanish messages.

#### Scenario: Rejected getter

- **WHEN** the getter rejects with an error
- **THEN** "Download failed" is announced in English or "No se pudo descargar" in Spanish
- **AND** `onDownloadError` receives the error
- **AND** no anchor is clicked

### Requirement: toCsv quotes cells and separates rows per RFC 4180

`toCsv` SHALL write the header row first, quote every cell that contains the delimiter, a double quote, CR or LF, double inner quotes, and join rows with CRLF unless `lineEnding` says otherwise. Options SHALL support comma (default), semicolon or tab delimiters, header false, BOM true (default false) and LF line endings.

#### Scenario: Special characters

- **WHEN** rows contain `Ana López`, `a,b`, `say "hi"` and a value with a newline
- **THEN** the cells are `Ana López`, `"a,b"`, `"say ""hi"""` and the quoted multi-line value
- **AND** rows are separated by CRLF

### Requirement: toCsv neutralises formula triggers in text cells

Unless `escapeFormulas` is false, `toCsv` and `escapeCsvCell` MUST prefix a single quote to text that starts with `=`, `+`, `-`, `@`, a tab or a carriage return, before quoting; number, boolean and date values SHALL NOT be prefixed. escapeCsvCell SHALL always protect formulas. Embedded equals or minus signs SHALL remain unchanged. A local fixture SHALL mirror the audit-log formula cases, with the documented difference that a CR-led cell is also quoted.

#### Scenario: Formula text

- **WHEN** a text cell is `=SUM(A1)`
- **THEN** the cell is written as `'=SUM(A1)`

#### Scenario: Negative number

- **WHEN** a cell value is the number -1
- **THEN** the cell is written as `-1`

### Requirement: toCsv writes empty, date and object values predictably

`toCsv` SHALL write `null` and `undefined` as empty cells, dates as ISO 8601 with `toISOString()`, and plain objects as JSON, so exports do not depend on the viewer's locale.

#### Scenario: Mixed row

- **WHEN** a row has `null`, the date 2026-10-01T08:00:00Z and `{ "tier": "pro" }`
- **THEN** the cells are empty, `2026-10-01T08:00:00.000Z` and the quoted JSON text

### Requirement: DownloadButton provides keyboard and theme accessibility

DownloadButton SHALL support Enter and Space activation and Tab navigation including while pending, use token classes only, and provide axe-clean examples in dark, light and high_contrast.

#### Scenario: Keyboard download

- **WHEN** a focused DownloadButton receives Enter or Space
- **THEN** one download is triggered
- **AND** Tab moves focus to the next control
