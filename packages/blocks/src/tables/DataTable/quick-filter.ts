import { matchText } from '@gntik-ai/ui';
import { formatCell, type CellValue, type DataTableCellFormatOptions, type DataTableColumn } from './data-table-utils';

/** Locale and boolean words used for the display text of default cells; they must match what the table renders. */
export type QuickFilterOptions = DataTableCellFormatOptions;

type Matcher<T> = (row: T, term: string) => boolean;
interface IndexedRow<T> {
  row: T;
  /** Searchable text per text column (raw value, then display text). */
  texts: string[][];
  matchers: Array<Matcher<T>>;
}

/** The terms of a quick filter: trimmed and split on whitespace. */
export function quickFilterTerms(term: string): string[] {
  return term.trim().split(/\s+/u).filter(Boolean);
}

const rawText = (value: CellValue): string => {
  if (value == null) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  return String(value);
};

function searchable<T>(column: DataTableColumn<T>, hidden: ReadonlySet<string>) {
  const setting = column.quickFilter;
  if (setting === false) return false;
  if (hidden.has(column.id)) return setting === true;
  return typeof setting === 'function' || column.accessor != null;
}

/** Collects the searchable text of every row once; reuse it while rows, columns, hidden columns and options hold. */
export function indexQuickFilter<T>(
  rows: readonly T[],
  columns: ReadonlyArray<DataTableColumn<T>>,
  hidden: ReadonlySet<string>,
  options?: QuickFilterOptions,
): Array<IndexedRow<T>> {
  const textColumns = columns.filter(
    (column) => typeof column.quickFilter !== 'function' && column.accessor != null && searchable(column, hidden),
  );
  const matchers = columns.flatMap((column) =>
    typeof column.quickFilter === 'function' && searchable(column, hidden) ? [column.quickFilter] : [],
  );
  return rows.map((row) => ({
    row,
    matchers,
    texts: textColumns.map((column) => {
      const value = column.accessor!(row);
      if (value == null) return [];
      const display = formatCell(value, options);
      return [rawText(value), typeof display === 'string' || typeof display === 'number' ? String(display) : ''].filter(
        Boolean,
      );
    }),
  }));
}

/** Rows of an index where every term matches some searchable column; case and accents are ignored. */
export function matchQuickFilter<T>(index: ReadonlyArray<IndexedRow<T>>, term: string, locale?: string): T[] {
  const terms = quickFilterTerms(term);
  return index
    .filter(({ row, texts, matchers }) =>
      terms.every(
        (one) =>
          texts.some((cell) => cell.some((text) => matchText(text, one, { locale }))) ||
          matchers.some((matcher) => matcher(row, one)),
      ),
    )
    .map(({ row }) => row);
}

/**
 * Keeps the rows where every whitespace-separated term of `term` matches at least one searchable column
 * (AND across terms, OR across columns). An empty term returns `rows` itself.
 */
export function quickFilterRows<T>(
  rows: readonly T[],
  columns: ReadonlyArray<DataTableColumn<T>>,
  term: string,
  hidden: ReadonlySet<string>,
  options?: QuickFilterOptions,
): readonly T[] {
  if (quickFilterTerms(term).length === 0) return rows;
  return matchQuickFilter(indexQuickFilter(rows, columns, hidden, options), term, options?.locale);
}
