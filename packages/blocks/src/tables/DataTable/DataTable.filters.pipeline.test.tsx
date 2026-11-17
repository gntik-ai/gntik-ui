import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { downloadFile, Input, type QueryGroup } from '@gntik-ai/ui';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';
import { sameViewState } from './views';

vi.mock('@gntik-ai/ui', async (original) => ({
  ...(await original<typeof import('@gntik-ai/ui')>()),
  downloadFile: vi.fn(),
}));
const rows = Array.from({ length: 95 }, (_, i) => ({ id: String(i), status: i < 4 ? 'failed' : 'paused' }));
const columns: DataTableColumn<(typeof rows)[number]>[] = [
  { id: 'id', header: 'Id', accessor: (r) => r.id },
  {
    id: 'status',
    header: 'Status',
    accessor: (r) => r.status,
    filter: {
      type: 'enum',
      options: [
        { value: 'failed', label: 'Failed' },
        { value: 'paused', label: 'Paused' },
      ],
    },
  },
];
const failed: QueryGroup = {
  type: 'group',
  id: 'root',
  combinator: 'and',
  children: [{ type: 'condition', id: 'status', field: 'status', operator: 'in', value: ['failed'] }],
};
const renderedRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');
async function applyFailed(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Filter Status' }));
  await user.click(await screen.findByRole('checkbox', { name: 'Failed' }));
  await user.click(screen.getByRole('button', { name: 'Apply' }));
}

it('reports exactly one server filter query and page request while rendering the supplied rows', async () => {
  const user = userEvent.setup();
  const onFilterModelChange = vi.fn();
  const onQueryChange = vi.fn();
  const onPageChange = vi.fn();
  render(
    <DataTable
      rows={rows.slice(0, 20)}
      columns={columns}
      paginationMode="server"
      page={3}
      pageSize={20}
      rowCount={95}
      onFilterModelChange={onFilterModelChange}
      onQueryChange={onQueryChange}
      onPageChange={onPageChange}
    />,
  );
  await applyFailed(user);
  expect(onFilterModelChange).toHaveBeenCalledTimes(1);
  expect(onPageChange.mock.calls).toEqual([[1]]);
  expect(onQueryChange.mock.calls).toEqual([
    [
      {
        page: 1,
        pageSize: 20,
        sort: null,
        filters: undefined,
        filterModel: onFilterModelChange.mock.lastCall![0],
        cause: 'filter',
      },
    ],
  ]);
  expect(renderedRows()).toHaveLength(20);
  expect(screen.getByRole('button', { name: 'Filter Status, filtered' }).closest('th')).toHaveAttribute(
    'data-filtered',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(onQueryChange.mock.lastCall![0].filterModel).toEqual(onFilterModelChange.mock.lastCall![0]);
});

it('uses filtered rows for group counts, page selection and rows-scope CSV', async () => {
  const user = userEvent.setup();
  const selection = vi.fn();
  vi.mocked(downloadFile).mockClear();
  render(<DataTable rows={rows} columns={columns} groupBy="status" onSelectionChange={selection} csvExport />);
  await applyFailed(user);
  expect(screen.getByRole('checkbox', { name: 'Select all in failed' })).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'Select all in paused' })).toBeNull();
  expect(screen.getByRole('button', { name: 'failed 4 rows' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  expect(selection.mock.lastCall).toEqual([['0', '1', '2', '3']]);
  await user.click(screen.getByRole('button', { name: 'Export' }));
  await user.click(await screen.findByRole('menuitem', { name: 'All rows (4)' }));
  expect(downloadFile).toHaveBeenCalledWith(
    '\uFEFFId,Status\r\n0,failed\r\n1,failed\r\n2,failed\r\n3,failed',
    'table.csv',
    'text/csv;charset=utf-8',
  );
});

it('clears all-matching client selection on header edits', async () => {
  const user = userEvent.setup();
  const selection = vi.fn();
  render(<DataTable rows={rows} columns={columns} selectAllMatching onSelectionChange={selection} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  await user.click(screen.getByRole('button', { name: 'Select all 95 rows' }));
  await applyFailed(user);
  expect(selection.mock.lastCall).toEqual([[]]);
  expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).not.toBeChecked();
});

it('clears an all-matching server selection when a controlled model changes', async () => {
  const selection = vi.fn();
  const props = {
    rows: rows.slice(0, 20),
    columns,
    paginationMode: 'server' as const,
    rowCount: 95,
    page: 3,
    pageSize: 20,
    selectAllMatching: true,
    onSelectionModelChange: selection,
    selectionModel: { type: 'exclude' as const, ids: [] },
  };
  const { rerender } = render(<DataTable {...props} />);
  rerender(<DataTable {...props} filterModel={failed} />);
  await waitFor(() => expect(selection).toHaveBeenCalledWith({ type: 'include', ids: [] }));
});

it('restores typed and legacy saved views, marks edits modified and saves the model', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  const query = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={columns}
      onViewsChange={save}
      onQueryChange={query}
      defaultViews={[
        { id: 'failed', name: 'Failed view', state: { filterModel: failed } },
        { id: 'legacy', name: 'Legacy view', state: {} },
      ]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Default view' }));
  await user.click(await screen.findByRole('menuitemradio', { name: 'Failed view' }));
  expect(renderedRows()).toHaveLength(4);
  expect(screen.getByRole('button', { name: 'Failed view' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Filter Status, filtered' }));
  await user.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(screen.getByRole('button', { name: 'Failed view (modified)' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Failed view (modified)' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Save changes' }));
  expect(save.mock.lastCall![0][0].state.filterModel.children).toEqual([]);
  await user.click(screen.getByRole('button', { name: 'Failed view' }));
  await user.click(await screen.findByRole('menuitemradio', { name: 'Legacy view' }));
  expect(renderedRows()).toHaveLength(10);
  expect(screen.getByRole('button', { name: 'Filter Status' })).toBeInTheDocument();
  expect(query.mock.lastCall![0].filterModel.children).toEqual([]);
  expect(sameViewState({}, { filterModel: { type: 'group', id: 'empty', combinator: 'and', children: [] } })).toBe(
    true,
  );
  expect(sameViewState({}, { filterModel: failed })).toBe(false);
});

it('seeds an active saved view and restores the default model for legacy views', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={rows}
      columns={columns}
      defaultFilterModel={failed}
      defaultActiveViewId="legacy"
      defaultViews={[{ id: 'legacy', name: 'Legacy', state: {} }]}
    />,
  );
  expect(renderedRows()).toHaveLength(4);
  await user.click(screen.getByRole('button', { name: 'Filter Status, filtered' }));
  await user.click(await screen.findByRole('button', { name: 'Clear' }));
  await user.click(screen.getByRole('button', { name: 'Legacy (modified)' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Reset changes' }));
  expect(renderedRows()).toHaveLength(4);
});

it.each(['text', 'custom'] as const)(
  'evaluates a %s editor against accessor results with locale matching',
  async (type) => {
    const user = userEvent.setup();
    const change = vi.fn();
    const filter =
      type === 'text'
        ? { type }
        : {
            type,
            render: ({ value, setValue }: import('./data-table-utils').DataTableFilterContext) => (
              <Input
                aria-label="Name"
                value={String(value?.value ?? '')}
                onChange={(e) => setValue({ operator: 'contains', value: e.target.value })}
              />
            ),
          };
    render(
      <DataTable
        rows={[
          { id: 'a', value: 'Café' },
          { id: 'b', value: 'Other' },
        ]}
        getRowLabel={(r) => r.id}
        columns={[{ id: 'display', header: 'Name', accessor: (r) => r.value, filter }]}
        onFilterModelChange={change}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Filter Name' }));
    await user.type(await screen.findByRole('textbox', { name: 'Name' }), 'cafe{Enter}');
    expect(change.mock.lastCall![0].children).toMatchObject([
      { field: 'display', operator: 'contains', value: 'cafe' },
    ]);
    expect(screen.getByRole('checkbox', { name: 'Select a' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Select b' })).toBeNull();
  },
);

it('resets the stored client page when an external model is applied and later cleared', () => {
  const page = vi.fn();
  const props = { rows, columns, defaultPage: 3, onPageChange: page };
  const { rerender } = render(<DataTable {...props} />);
  rerender(<DataTable {...props} filterModel={failed} />);
  expect(page.mock.calls).toEqual([[1]]);
  rerender(<DataTable {...props} filterModel={{ type: 'group', id: 'clear', combinator: 'and', children: [] }} />);
  expect(screen.getByRole('button', { name: 'Page 1', current: 'page' })).toBeInTheDocument();
});

it('compares saved filter meaning independently of node ids and object key order', () => {
  expect(
    sameViewState(
      { filterModel: failed },
      {
        filterModel: {
          id: 'other-root',
          children: [{ value: ['failed'], operator: 'in', field: 'status', id: 'other-condition', type: 'condition' }],
          combinator: 'and',
          type: 'group',
        },
      },
    ),
  ).toBe(true);
});
