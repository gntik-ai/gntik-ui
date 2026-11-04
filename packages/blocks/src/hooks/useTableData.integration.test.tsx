import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../tables/DataTable/DataTable';
import { useTableData, type TableDataParams } from './useTableData';

const columns = [
  { id: 'name', header: 'Name', accessor: (row: { id: number; name: string }) => row.name, sortable: true },
];
const page = { rows: [{ id: 21, name: 'Item 21' }], rowCount: 95 };

it.each(['resize', 'sort', 'clear sort'] as const)(
  'makes one complete request through DataTable on %s',
  async (action) => {
    const user = userEvent.setup();
    const getRows = vi.fn<(params: TableDataParams) => Promise<typeof page>>().mockResolvedValue(page);
    function Table() {
      const data = useTableData({
        getRows,
        initialPage: 2,
        initialSort: action === 'clear sort' ? { columnId: 'name', direction: 'ascending' } : null,
      });
      return (
        <DataTable
          {...data.tableProps}
          columns={columns}
          selectionMode="none"
          defaultViews={[{ id: 'clear', name: 'Clear sort', state: { sort: null } }]}
        />
      );
    }
    render(<Table />);
    await screen.findByText('Item 21');
    if (action === 'resize') {
      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      await user.click(await screen.findByRole('option', { name: '50' }));
    } else if (action === 'sort') {
      await user.click(screen.getByRole('button', { name: 'Name' }));
    } else {
      await user.click(screen.getByRole('button', { name: /Default view/ }));
      await user.click(await screen.findByRole('menuitemradio', { name: 'Clear sort' }));
    }
    expect(getRows).toHaveBeenCalledTimes(2);
    expect(getRows.mock.calls[1]![0]).toMatchObject({
      page: 1,
      pageSize: action === 'resize' ? 50 : 20,
      sort: action === 'sort' ? { columnId: 'name', direction: 'ascending' } : null,
    });
  },
);

it('shows the requested aria-sort immediately and rolls back after rejection', async () => {
  const user = userEvent.setup();
  let reject!: (error: unknown) => void;
  const getRows = vi
    .fn<() => Promise<typeof page>>()
    .mockResolvedValueOnce(page)
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        }),
    );
  function Table() {
    const { tableProps } = useTableData({ getRows, initialPage: 2 });
    return <DataTable {...tableProps} columns={columns} />;
  }
  render(<Table />);
  await screen.findByText('Item 21');
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  await act(async () => reject(new Error('Unavailable')));
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none');
  expect(screen.getByText('Item 21')).toBeInTheDocument();
});

it('preserves the first visible row when DataTable resizes page five', async () => {
  const user = userEvent.setup();
  const getRows = vi.fn<(params: TableDataParams) => Promise<typeof page>>().mockResolvedValue(page);
  function Table() {
    const { tableProps } = useTableData({ getRows, initialPage: 5 });
    return <DataTable {...tableProps} columns={columns} selectionMode="none" />;
  }
  render(<Table />);
  await screen.findByText('Item 21');
  await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
  await user.click(await screen.findByRole('option', { name: '50' }));
  expect(getRows).toHaveBeenCalledTimes(2);
  expect(getRows.mock.calls[1]![0]).toMatchObject({ page: 2, pageSize: 50, sort: null });
});
