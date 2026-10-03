import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable } from './DataTable';
import { compareValues, paginate, selectionState, sortRows, toggleAll, type DataTableColumn } from './data-table-utils';
import { DEPLOYMENT_ROWS } from './fixtures';

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

describe('DataTable', () => {
  it('renders the first page with defaults', async () => {
    const { container } = render(<DataTable rowActions={() => [{ label: 'Open' }]} />);
    expect(screen.getByRole('table', { name: 'Deployments' })).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.queryByRole('columnheader', { name: /Updated/ })).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('sorts by a column and exposes aria-sort', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<DataTable onSortChange={onSortChange} />);
    await user.click(screen.getByRole('button', { name: /Cost/ }));
    const head = screen.getByRole('columnheader', { name: /Cost/ });
    expect(head).toHaveAttribute('aria-sort', 'ascending');
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'cost', direction: 'ascending' });
    const min = Math.min(...DEPLOYMENT_ROWS.map((r) => r.cost));
    expect(within(bodyRows()[0]!).getByText(`$${min.toFixed(2)}`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cost/ }));
    expect(head).toHaveAttribute('aria-sort', 'descending');
  });

  it('selects rows, with select-all and indeterminate', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<DataTable onSelectionChange={onSelectionChange} bulkActions={() => <button type="button">Pause</button>} />);
    const all = screen.getByRole('checkbox', { name: 'Select all rows on this page' });
    await user.click(screen.getByRole('checkbox', { name: `Select ${DEPLOYMENT_ROWS[0]!.name}` }));
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    await user.click(all);
    expect(all).toHaveAttribute('aria-checked', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.arrayContaining([DEPLOYMENT_ROWS[9]!.id]));
    expect(onSelectionChange.mock.lastCall?.[0]).toHaveLength(10);
    await user.click(all);
    expect(all).toHaveAttribute('aria-checked', 'false');
  });

  it('hides its own selection count with selectionSummary={false}', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DataTable selectionSummary={false} toolbar={<span>Filters here</span>} />);
    await user.click(screen.getByRole('checkbox', { name: `Select ${DEPLOYMENT_ROWS[0]!.name}` }));
    expect(screen.queryByText('1 selected')).toBeNull();
    expect(screen.getByText('Filters here')).toBeInTheDocument();
    rerender(<DataTable selectionSummary={false} toolbar={<span>Filters here</span>} bulkActions={() => <button type="button">Pause</button>} />);
    expect(screen.queryByText('1 selected')).toBeNull();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('applies column variant presets', () => {
    type Row = { id: string; name: string; region: string; note: string; cost: number };
    const columns: Array<DataTableColumn<Row>> = [
      { id: 'name', header: 'Name', accessor: (r) => r.name },
      { id: 'region', header: 'Region', accessor: (r) => r.region, variant: 'mono' },
      { id: 'note', header: 'Note', accessor: (r) => r.note, variant: 'muted' },
      { id: 'cost', header: 'Cost', accessor: (r) => r.cost, variant: 'numeric', className: 'font-semibold' },
    ];
    render(<DataTable<Row> rows={[{ id: 'a', name: 'api', region: 'eu-west-1', note: 'Paused', cost: 12 }]} columns={columns} selectable={false} />);
    expect(screen.getByText('api').closest('td')).not.toHaveClass('font-mono');
    expect(screen.getByText('eu-west-1').closest('td')).toHaveClass('font-mono');
    expect(screen.getByText('Paused').closest('td')).toHaveClass('text-muted-foreground');
    const cost = screen.getByText('12').closest('td')!;
    expect(cost).toHaveClass('tabular-nums', 'font-semibold');
    expect(cost.className).toMatch(/text-right|justify-end/);
  });

  it('toggles columns, density and pages', async () => {
    const user = userEvent.setup();
    render(<DataTable />);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Updated' }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Region' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('columnheader', { name: /Updated/ })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Region/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Compact rows' }));
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(bodyRows()).toHaveLength(4);
  });

  it('shows loading and empty states', async () => {
    const { rerender, container } = render(<DataTable loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading deployments');
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    rerender(<DataTable rows={[]} />);
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
    await expectNoAxeViolations(container);
  });
});

describe('data-table-utils', () => {
  type Row = { id: string; n: number | null };
  const cols: DataTableColumn<Row>[] = [{ id: 'n', header: 'N', accessor: (r) => r.n }];
  const rows: Row[] = [
    { id: 'a', n: 3 },
    { id: 'b', n: null },
    { id: 'c', n: 1 },
    { id: 'd', n: 2 },
  ];

  it('sorts with nulls last in both directions', () => {
    expect(sortRows(rows, cols, { columnId: 'n', direction: 'ascending' }).map((r) => r.id)).toEqual(['c', 'd', 'a', 'b']);
    expect(sortRows(rows, cols, { columnId: 'n', direction: 'descending' }).map((r) => r.id)).toEqual(['a', 'd', 'c', 'b']);
    expect(sortRows(rows, cols, null)).toEqual(rows);
    expect(compareValues('item 2', 'item 10')).toBeLessThan(0);
  });

  it('paginates and clamps', () => {
    expect(paginate(rows, 2, 3)).toEqual([rows[3]]);
    expect(paginate(rows, 9, 3)).toEqual([rows[3]]);
  });

  it('computes and toggles the selection', () => {
    expect(selectionState(['a', 'b'], new Set(['a']))).toEqual({ checked: false, indeterminate: true });
    expect([...toggleAll(['a', 'b'], new Set(['a', 'z']))].sort()).toEqual(['a', 'b', 'z']);
    expect([...toggleAll(['a', 'b'], new Set(['a', 'b', 'z']))]).toEqual(['z']);
  });
});
