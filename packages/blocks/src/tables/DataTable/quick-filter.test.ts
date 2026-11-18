import { describe, expect, it } from 'vitest';
import type { DataTableColumn } from './data-table-utils';
import { quickFilterRows } from './quick-filter';

interface Row {
  id: string;
  name: string;
  region: string;
  owner?: { name: string; email: string };
  at?: Date;
  count?: number;
  active?: boolean;
}

const rows: Row[] = [
  { id: 'a1', name: 'orders-api', region: 'eu-west-1' },
  { id: 'b2', name: 'billing-sync', region: 'us-east-1' },
  { id: 'c3', name: 'Función', region: 'eu-south-2' },
];
const columns: Array<DataTableColumn<Row>> = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
  { id: 'region', header: 'Region', accessor: (row) => row.region },
];
const names = (found: readonly Row[]) => found.map((row) => row.name);
const none = new Set<string>();

describe('quickFilterRows', () => {
  it('keeps rows where every term matches a column (AND across terms, OR across columns)', () => {
    expect(names(quickFilterRows(rows, columns, 'orders eu', none))).toEqual(['orders-api']);
    expect(names(quickFilterRows(rows, columns, 'eu', none))).toEqual(['orders-api', 'Función']);
    expect(names(quickFilterRows(rows, columns, 'orders us', none))).toEqual([]);
  });

  it('ignores case and accents in both directions', () => {
    expect(names(quickFilterRows(rows, columns, 'ORDERS', none))).toEqual(['orders-api']);
    expect(names(quickFilterRows(rows, columns, 'funcion', none))).toEqual(['Función']);
    expect(names(quickFilterRows(rows, columns, 'FUNCIÓN', none))).toEqual(['Función']);
  });

  it('returns the same array for an empty or whitespace term', () => {
    expect(quickFilterRows(rows, columns, '', none)).toBe(rows);
    expect(quickFilterRows(rows, columns, '  \t ', none)).toBe(rows);
  });

  it('trims the term and splits it on any whitespace', () => {
    expect(names(quickFilterRows(rows, columns, '  orders \n  eu  ', none))).toEqual(['orders-api']);
  });

  it('never searches a column with quickFilter false', () => {
    const optOut = [columns[0]!, { ...columns[1]!, quickFilter: false }];
    expect(names(quickFilterRows(rows, optOut, 'eu-west', none))).toEqual([]);
    expect(names(quickFilterRows(rows, optOut, 'orders', none))).toEqual(['orders-api']);
  });

  it('searches a hidden column only with quickFilter true', () => {
    const hidden = new Set(['region']);
    expect(names(quickFilterRows(rows, columns, 'eu-west', hidden))).toEqual([]);
    const optIn = [columns[0]!, { ...columns[1]!, quickFilter: true as const }];
    expect(names(quickFilterRows(rows, optIn, 'eu-west', hidden))).toEqual(['orders-api']);
  });

  it('lets a matcher function decide alone for its column', () => {
    const calls: string[] = [];
    const matcher: Array<DataTableColumn<Row>> = [
      columns[0]!,
      {
        id: 'owner',
        header: 'Owner',
        accessor: () => 'never-searched-as-text',
        quickFilter: (row, term) => {
          calls.push(term);
          return row.owner?.email === term;
        },
      },
    ];
    const owned: Row[] = [{ ...rows[0]!, owner: { name: 'Ana', email: 'ana@example.test' } }, rows[1]!];
    expect(names(quickFilterRows(owned, matcher, 'ana@example.test', none))).toEqual(['orders-api']);
    expect(names(quickFilterRows(owned, matcher, 'never-searched-as-text', none))).toEqual([]);
    expect(calls).toContain('ana@example.test');
  });

  it('does not search a column that has a cell but no accessor', () => {
    const cellOnly: Array<DataTableColumn<Row>> = [{ id: 'name', header: 'Name', cell: (row) => row.name }];
    expect(names(quickFilterRows(rows, cellOnly, 'orders', none))).toEqual([]);
  });

  it('does not search a cell-only column even when its quickFilter is true or a matcher', () => {
    const always: Array<DataTableColumn<Row>> = [
      { id: 'flag', header: 'Flag', cell: (row) => row.name, quickFilter: true },
      { id: 'fn', header: 'Fn', cell: (row) => row.name, quickFilter: () => true },
    ];
    expect(names(quickFilterRows(rows, always, 'anything', none))).toEqual([]);
    expect(names(quickFilterRows(rows, always, 'anything', new Set(['flag'])))).toEqual([]);
  });

  it('matches the raw value text as well as the display text', () => {
    const typed: Array<DataTableColumn<Row>> = [
      { id: 'at', header: 'At', accessor: (row) => row.at },
      { id: 'count', header: 'Count', accessor: (row) => row.count },
      { id: 'active', header: 'Active', accessor: (row) => row.active },
    ];
    const data: Row[] = [
      { id: 'x', name: 'x', region: '', at: new Date('2026-03-04T10:00:00Z'), count: 1.5, active: true },
      { id: 'y', name: 'y', region: '', count: 2, active: false },
    ];
    const options = { locale: 'es', booleanLabels: ['Sí', 'No'] as [string, string] };
    expect(data.map((row) => row.id)).toEqual(['x', 'y']);
    // ISO date (raw) and comma decimal (display).
    expect(quickFilterRows(data, typed, '2026-03-04', none, options).map((row) => row.id)).toEqual(['x']);
    expect(quickFilterRows(data, typed, '1,5', none, options).map((row) => row.id)).toEqual(['x']);
    expect(quickFilterRows(data, typed, '1.5', none, options).map((row) => row.id)).toEqual(['x']);
    expect(quickFilterRows(data, typed, 'si', none, options).map((row) => row.id)).toEqual(['x']);
  });

  it('does not match the placeholder shown for empty values', () => {
    const typed: Array<DataTableColumn<Row>> = [{ id: 'count', header: 'Count', accessor: (row) => row.count }];
    expect(quickFilterRows([{ id: 'x', name: 'x', region: '' }], typed, '—', none)).toEqual([]);
  });
});
