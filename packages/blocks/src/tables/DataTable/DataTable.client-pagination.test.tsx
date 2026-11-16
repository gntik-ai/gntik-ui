import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableProps } from './DataTable';
import type { DataTableColumn } from './data-table-utils';

type Row = { id: number };
const rows = Array.from({ length: 95 }, (_, i) => ({ id: i + 1 }));
const columns: DataTableColumn<Row>[] = [{ id: 'id', header: 'Id', accessor: (row) => row.id, sortable: true }];
const table = { rows, columns, selectionMode: 'none' as const, showColumnMenu: false, showDensityToggle: false };
const visibleIds = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getByRole('cell').textContent);

const controlledClient: DataTableProps<Row> = {
  page: 3,
  onPageChange: () => {},
  pageSize: 10,
  onPageSizeChange: () => {},
};
// @ts-expect-error A total belongs only to explicit server pagination.
const invalidClient: DataTableProps<Row> = { paginationMode: 'client', rowCount: 95 };
// @ts-expect-error Without paginationMode, rowCount cannot select server mode.
const invalidImplicitClient: DataTableProps<Row> = { page: 1, pageSize: 10, rowCount: 95 };
void controlledClient;
void invalidClient;
void invalidImplicitClient;

describe('DataTable client pagination', () => {
  it('clamps a stale page for rows and footer without callbacks, then requests the displayed previous page', () => {
    const onPageChange = vi.fn();
    render(<DataTable {...table} page={20} onPageChange={onPageChange} />);
    expect(visibleIds()).toEqual(['91', '92', '93', '94', '95']);
    expect(screen.getByRole('button', { name: 'Page 10', current: 'page' })).toBeInTheDocument();
    expect(onPageChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange.mock.calls).toEqual([[9]]);
    expect(visibleIds()[0]).toBe('91');
  });
  it('requests a controlled size and keep-first-row page in one query, waiting for props', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const onQueryChange = vi.fn();
    const { rerender } = render(
      <DataTable
        {...table}
        page={3}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onQueryChange={onQueryChange}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '25' }));
    expect(onPageSizeChange.mock.calls).toEqual([[25]]);
    expect(onPageChange.mock.calls).toEqual([[1]]);
    expect(onQueryChange.mock.calls).toEqual([
      [{ page: 1, pageSize: 25, sort: null, filters: undefined, cause: 'pageSize' }],
    ]);
    expect(visibleIds()).toHaveLength(10);
    expect(visibleIds()[0]).toBe('21');
    rerender(
      <DataTable
        {...table}
        page={1}
        pageSize={25}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onQueryChange={onQueryChange}
      />,
    );
    expect(visibleIds()).toHaveLength(25);
    expect(visibleIds()).toContain('21');
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });
  it.each([1, 3])('requests a reset once for sorting and saved views at controlled page %s', async (page) => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onQueryChange = vi.fn();
    render(
      <DataTable
        {...table}
        page={page}
        onPageChange={onPageChange}
        onQueryChange={onQueryChange}
        defaultViews={[{ id: 'saved', name: 'Saved', state: {} }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Id' }));
    expect(onPageChange.mock.calls).toEqual(page === 1 ? [] : [[1]]);
    expect(onQueryChange).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 10,
      sort: { columnId: 'id', direction: 'ascending' },
      filters: undefined,
      cause: 'sort',
    });
    onPageChange.mockClear();
    onQueryChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Default view (modified)' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Saved' }));
    expect(onPageChange.mock.calls).toEqual(page === 1 ? [] : [[1]]);
    expect(onQueryChange.mock.calls).toEqual([
      [{ page: 1, pageSize: 10, sort: null, filters: undefined, cause: 'view' }],
    ]);
    expect(screen.getByRole('button', { name: `Page ${page}`, current: 'page' })).toBeInTheDocument();
  });
  it('starts at defaultPage and pages internally', () => {
    render(<DataTable {...table} defaultPage={2} />);
    expect(visibleIds()[0]).toBe('11');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(visibleIds()[0]).toBe('21');
    expect(screen.getByRole('button', { name: 'Page 3', current: 'page' })).toBeInTheDocument();
  });
  it('renders a controlled page, requests navigation once and waits for its prop', () => {
    const onPageChange = vi.fn();
    const onQueryChange = vi.fn();
    const { rerender } = render(
      <DataTable {...table} page={3} onPageChange={onPageChange} onQueryChange={onQueryChange} />,
    );
    expect(visibleIds()).toEqual(['21', '22', '23', '24', '25', '26', '27', '28', '29', '30']);
    expect(screen.getByText('21–30')).toHaveTextContent('21–30');
    expect(screen.getByText('21–30').parentElement).toHaveTextContent('21–30 of 95');
    expect(screen.getByRole('button', { name: 'Page 3', current: 'page' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange.mock.calls).toEqual([[4]]);
    expect(onQueryChange.mock.calls).toEqual([
      [{ page: 4, pageSize: 10, sort: null, filters: undefined, cause: 'page' }],
    ]);
    expect(visibleIds()[0]).toBe('21');
    rerender(<DataTable {...table} page={4} onPageChange={onPageChange} onQueryChange={onQueryChange} />);
    expect(visibleIds()[0]).toBe('31');
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });
});
