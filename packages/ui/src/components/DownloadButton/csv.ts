export interface CsvColumn<Row> {
  header: string;
  value: keyof Row | ((row: Row) => unknown);
}

export interface CsvOptions {
  delimiter?: ',' | ';' | '\t';
  header?: boolean;
  bom?: boolean;
  lineEnding?: '\r\n' | '\n';
  /** Defaults to true. Disabling this is unsafe for spreadsheet consumers. */
  escapeFormulas?: boolean;
}

function quoteCell(value: string, delimiter: string): string {
  return value.includes(delimiter) || /["\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Neutralises spreadsheet formula prefixes before applying CSV quoting. */
export function escapeCsvCell(value: string, delimiter = ','): string {
  return quoteCell(/^[=+@\t\r-]/.test(value) ? `'${value}` : value, delimiter);
}

function serializeCell(value: unknown, delimiter: string, escapeFormulas: boolean): string {
  if (value == null) return '';
  if (typeof value === 'string') return escapeFormulas ? escapeCsvCell(value, delimiter) : quoteCell(value, delimiter);
  if (value instanceof Date) return quoteCell(value.toISOString(), delimiter);
  if (typeof value === 'object') return quoteCell(JSON.stringify(value) ?? '', delimiter);
  return quoteCell(String(value), delimiter);
}

/** Serialises rows in memory. Defaults: header, comma, CRLF, no BOM, formula protection. */
export function toCsv<Row>(
  rows: readonly Row[],
  columns: readonly CsvColumn<Row>[],
  { delimiter = ',', header = true, bom = false, lineEnding = '\r\n', escapeFormulas = true }: CsvOptions = {},
): string {
  const cell = (value: unknown) => serializeCell(value, delimiter, escapeFormulas);
  const lines = header ? [columns.map((column) => cell(column.header)).join(delimiter)] : [];
  for (const row of rows) {
    lines.push(
      columns
        .map((column) => cell(typeof column.value === 'function' ? column.value(row) : row[column.value]))
        .join(delimiter),
    );
  }
  return (bom ? '\uFEFF' : '') + lines.join(lineEnding);
}
