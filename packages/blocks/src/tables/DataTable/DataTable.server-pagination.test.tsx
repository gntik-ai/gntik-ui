import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableProps } from './DataTable';
import type { DataTableColumn } from './data-table-utils';

type Row = { id: number; name: string; region: string };
const rows: Row[] = Array.from({ length: 20 }, (_, i) => ({
  id: 40 - i,
  name: `Item ${40 - i}`,
  region: i % 2 ? 'East' : 'West',
}));
const columns: DataTableColumn<Row>[] = [
  { id: 'id', header: 'Id', accessor: (row) => row.id, sortable: true },
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
  { id: 'region', header: 'Region', accessor: (row) => row.region, sortable: true },
];
const server = {
  paginationMode: 'server' as const,
  selectionMode: 'none' as const,
  rows,
  columns,
  caption: 'Items',
  page: 2,
  pageSize: 20,
  rowCount: 95,
  pageSizeOptions: [10, 20, 50],
};
const renderedIds = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]!.textContent);
const summary = () => document.querySelector('[aria-live="polite"]');

// @ts-expect-error Server pagination needs a known total.
const missingTotal: DataTableProps<Row> = { paginationMode: 'server', page: 1, pageSize: 20 };
// Single selection accepts the same controlled server pagination contract.
const singleServer: DataTableProps<Row> = { ...server, selectionMode: 'single', paginated: false };
void missingTotal;
void singleServer;

describe('DataTable controlled server pagination', () => {
  it('renders the supplied page in order and counts the full result set', () => {
    render(<DataTable {...server} />);
    expect(renderedIds()).toEqual([
      '40',
      '39',
      '38',
      '37',
      '36',
      '35',
      '34',
      '33',
      '32',
      '31',
      '30',
      '29',
      '28',
      '27',
      '26',
      '25',
      '24',
      '23',
      '22',
      '21',
    ]);
    expect(summary()).toHaveTextContent('21–40 of 95');
    expect(screen.getByRole('button', { name: 'Page 2', current: 'page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 6' })).not.toBeInTheDocument();
  });

  it('requests 1-based pages once and waits for consumer updates', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(<DataTable {...server} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange.mock.calls).toEqual([[3]]);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
    expect(screen.getByRole('button', { name: 'Page 2', current: 'page' })).toBeInTheDocument();
    expect(summary()).toHaveTextContent('21–40 of 95');
    expect(renderedIds()).toHaveLength(20);
    rerender(<DataTable {...server} page={1} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    rerender(<DataTable {...server} page={5} rows={rows.slice(0, 15)} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(summary()).toHaveTextContent('81–95 of 95');
    expect(renderedIds()).toHaveLength(15);
    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it('requests a new size and only the footer keep-first-row page, without slicing', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(<DataTable {...server} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '50' }));
    expect(onPageSizeChange.mock.calls).toEqual([[50]]);
    expect(onPageChange.mock.calls).toEqual([[1]]);
    expect(renderedIds()).toHaveLength(20);
    expect(summary()).toHaveTextContent('21–40 of 95');
  });

  it.each([false, true])('has inert headers even with controlled sort and resizable=%s', async (resizable) => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        {...server}
        resizable={resizable}
        sort={{ columnId: 'id', direction: 'ascending' }}
        onSortChange={onSortChange}
      />,
    );
    const before = renderedIds();
    for (const header of screen.getAllByRole('columnheader')) {
      expect(header).not.toHaveAttribute('aria-sort');
      expect(within(header).queryByRole('button')).not.toBeInTheDocument();
      expect(header.querySelector('svg')).toBeNull();
      await user.click(header);
      fireEvent.keyDown(header, { key: 'Enter' });
    }
    expect(renderedIds()).toEqual(before);
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('applying a sorted saved view does not request a sort or page', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <DataTable
        {...server}
        defaultViews={[{ id: 'saved', name: 'Saved', state: { sort: { columnId: 'id', direction: 'ascending' } } }]}
        onSortChange={onSortChange}
        onPageChange={onPageChange}
      />,
    );
    const before = renderedIds();
    await user.click(screen.getByRole('button', { name: 'Default view' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Saved' }));
    expect(renderedIds()).toEqual(before);
    expect(onPageChange).not.toHaveBeenCalled();
    expect(onSortChange).not.toHaveBeenCalled();
    expect(summary()).toHaveTextContent('21–40 of 95');
  });

  it.each([1, 3])('keeps an empty server footer at page 1 without callbacks for supplied page %s', (page) => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <DataTable
        {...server}
        rows={[]}
        rowCount={0}
        page={page}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(summary()).toHaveTextContent('0–0 of 0');
    expect(screen.getByRole('button', { name: 'Page 1', current: 'page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 2' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(onPageChange).not.toHaveBeenCalled();
    expect(onPageSizeChange).not.toHaveBeenCalled();
  });
});
