import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableProps, type DataTableQuery } from './DataTable';
import ServerPaginationExample from './examples/server-pagination';
import { expectNoAxeViolations } from '../../test/a11y';
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
    render(<DataTable {...server} sort={{ columnId: 'id', direction: 'ascending' }} />);
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

  it('reports controlled page requests synchronously without reacting to prop updates', () => {
    const onQueryChange = vi.fn();
    const onPageChange = vi.fn();
    const { rerender } = render(
      <DataTable
        {...server}
        page={1}
        pageSize={50}
        filters={{ status: 'failed' }}
        onPageChange={onPageChange}
        onQueryChange={onQueryChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange.mock.calls).toEqual([[2]]);
    expect(onQueryChange.mock.calls).toEqual([
      [{ page: 2, pageSize: 50, sort: null, filters: { status: 'failed' }, cause: 'page' }],
    ]);
    rerender(
      <DataTable
        {...server}
        page={2}
        pageSize={50}
        filters={{ status: 'active' }}
        onPageChange={onPageChange}
        onQueryChange={onQueryChange}
      />,
    );
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it.each([
    [2, 1],
    [1, 1],
    [5, 2],
    [99, 2],
  ])('reports one complete resize query from supplied page %s', async (page, nextPage) => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const onPageChange = vi.fn(() => calls.push('page'));
    const onPageSizeChange = vi.fn(() => calls.push('size'));
    const onQueryChange = vi.fn();
    render(
      <DataTable
        {...server}
        page={page}
        defaultSort={{ columnId: 'name', direction: 'ascending' }}
        filters={{ status: 'failed' }}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onQueryChange={onQueryChange}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '50' }));
    expect(onPageSizeChange.mock.calls).toEqual([[50]]);
    expect(onPageChange.mock.calls).toEqual(page === 1 ? [] : [[nextPage]]);
    expect(calls).toEqual(page === 1 ? ['size'] : ['size', 'page']);
    expect(onQueryChange.mock.calls).toEqual([
      [
        {
          page: nextPage,
          pageSize: 50,
          sort: { columnId: 'name', direction: 'ascending' },
          filters: { status: 'failed' },
          cause: 'pageSize',
        },
      ],
    ]);
    expect(renderedIds()).toHaveLength(20);
  });

  it('reports one complete resize query for an empty server result', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const onPageSizeChange = vi.fn(() => calls.push('size'));
    const onPageChange = vi.fn(() => calls.push('page'));
    const onQueryChange = vi.fn(() => calls.push('query'));
    render(
      <DataTable
        {...server}
        rows={[]}
        rowCount={0}
        page={1}
        sort={{ columnId: 'name', direction: 'ascending' }}
        filters={{ status: 'failed' }}
        onPageSizeChange={onPageSizeChange}
        onPageChange={onPageChange}
        onQueryChange={onQueryChange}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '50' }));
    expect(onQueryChange.mock.calls).toEqual([
      [
        {
          page: 1,
          pageSize: 50,
          sort: { columnId: 'name', direction: 'ascending' },
          filters: { status: 'failed' },
          cause: 'pageSize',
        },
      ],
    ]);
    expect(onPageSizeChange.mock.calls).toEqual([[50]]);
    expect(onPageChange.mock.calls).toEqual([[1]]);
    expect(calls).toEqual(['size', 'page', 'query']);
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

  it.each([false, true])('requests server sorting without reordering rows, resizable=%s', async (resizable) => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <DataTable {...server} page={1} resizable={resizable} onSortChange={onSortChange} onPageChange={onPageChange} />,
    );
    const before = renderedIds();
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange.mock.calls).toEqual([[{ columnId: 'name', direction: 'ascending' }]]);
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange.mock.calls).toEqual([
      [{ columnId: 'name', direction: 'ascending' }],
      [{ columnId: 'name', direction: 'descending' }],
    ]);
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'descending');
    expect(renderedIds()).toEqual(before);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it.each([false, true])('reports the next sort and first page with query-only=%s', (queryOnly) => {
    const calls: string[] = [];
    const onSortChange = vi.fn(() => calls.push('sort'));
    const onPageChange = vi.fn(() => calls.push('page'));
    const onQueryChange = vi.fn(() => calls.push('query'));
    const filters = { status: 'failed' };
    render(
      <DataTable
        {...server}
        page={3}
        filters={filters}
        onSortChange={queryOnly ? undefined : onSortChange}
        onPageChange={onPageChange}
        onQueryChange={onQueryChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    expect(onPageChange.mock.calls).toEqual([[1]]);
    expect(onQueryChange.mock.calls).toEqual([
      [
        {
          page: 1,
          pageSize: 20,
          sort: { columnId: 'name', direction: 'ascending' },
          filters: { status: 'failed' },
          cause: 'sort',
        },
      ],
    ]);
    expect(calls).toEqual(queryOnly ? ['page', 'query'] : ['sort', 'page', 'query']);
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('keeps controlled sort until the consumer updates it', () => {
    const onSortChange = vi.fn();
    const onQueryChange = vi.fn();
    const { rerender } = render(
      <DataTable {...server} page={1} sort={null} onSortChange={onSortChange} onQueryChange={onQueryChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange.mock.calls).toEqual([[{ columnId: 'name', direction: 'ascending' }]]);
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'none');
    rerender(
      <DataTable
        {...server}
        page={1}
        sort={{ columnId: 'name', direction: 'ascending' }}
        onSortChange={onSortChange}
        onQueryChange={onQueryChange}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending');
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('has plain headers without sort handlers and resizable=%s', async (resizable) => {
    const user = userEvent.setup();
    render(<DataTable {...server} resizable={resizable} sort={{ columnId: 'id', direction: 'ascending' }} />);
    const before = renderedIds();
    for (const header of screen.getAllByRole('columnheader')) {
      expect(header).not.toHaveAttribute('aria-sort');
      expect(within(header).queryByRole('button')).not.toBeInTheDocument();
      expect(header.querySelector('svg')).toBeNull();
      await user.click(header);
      fireEvent.keyDown(header, { key: 'Enter' });
    }
    expect(renderedIds()).toEqual(before);
  });

  it('keeps the server page when a saved view changes an unhandled sort', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <DataTable
        {...server}
        defaultViews={[{ id: 'saved', name: 'Saved', state: { sort: { columnId: 'id', direction: 'ascending' } } }]}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Default view' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Saved' }));
    expect(onPageChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Page 2', current: 'page' })).toBeInTheDocument();
  });

  it.each([
    { savedSort: { columnId: 'id', direction: 'ascending' as const }, page: 2, expectedPage: 1, changed: true },
    { savedSort: { columnId: 'name', direction: 'ascending' as const }, page: 2, expectedPage: 2, changed: false },
    { savedSort: null, page: 2, expectedPage: 1, changed: true },
    { savedSort: { columnId: 'id', direction: 'ascending' as const }, page: 1, expectedPage: 1, changed: true },
  ])(
    'applies saved sort $savedSort at page $page with the view filters',
    async ({ savedSort, page, expectedPage, changed }) => {
      const user = userEvent.setup();
      const calls: string[] = [];
      const onSortChange = vi.fn(() => calls.push('sort'));
      const onPageChange = vi.fn(() => calls.push('page'));
      const onFiltersChange = vi.fn(() => calls.push('filters'));
      const onQueryChange = vi.fn(() => calls.push('query'));
      render(
        <DataTable
          {...server}
          page={page}
          defaultSort={{ columnId: 'name', direction: 'ascending' }}
          filters={{ status: 'active' }}
          defaultViews={[{ id: 'saved', name: 'Saved', state: { sort: savedSort, filters: { status: 'failed' } } }]}
          onSortChange={onSortChange}
          onPageChange={onPageChange}
          onFiltersChange={onFiltersChange}
          onQueryChange={onQueryChange}
        />,
      );
      const before = renderedIds();
      await user.click(screen.getByRole('button', { name: 'Default view' }));
      await user.click(await screen.findByRole('menuitemradio', { name: 'Saved' }));
      expect(renderedIds()).toEqual(before);
      expect(onSortChange.mock.calls).toEqual(changed && savedSort ? [[savedSort]] : []);
      expect(onPageChange.mock.calls).toEqual(changed && page !== 1 ? [[1]] : []);
      expect(onFiltersChange.mock.calls).toEqual([[{ status: 'failed' }]]);
      expect(onQueryChange.mock.calls).toEqual([
        [{ page: expectedPage, pageSize: 20, sort: savedSort, filters: { status: 'failed' }, cause: 'view' }],
      ]);
      expect(calls).toEqual([
        ...(changed && savedSort ? ['sort'] : []),
        'filters',
        ...(changed && page !== 1 ? ['page'] : []),
        'query',
      ]);
    },
  );

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

it('server pagination example sorts through its query handler and stays accessible', async () => {
  const user = userEvent.setup();
  const { container } = render(<ServerPaginationExample />);
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'descending');
  expect(await screen.findByRole('checkbox', { name: 'Select 95' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Page 1', current: 'page' })).toBeInTheDocument();
  await expectNoAxeViolations(container);
});

it.each(['success', 'failure'])(
  'server pagination example ignores an older %s after a newer query completes',
  async (outcome) => {
    type Response = {
      items: Array<{ id: number; name: string; locked: boolean }>;
      total: number;
      page: number;
      pageSize: number;
      sort: DataTableQuery['sort'];
    };
    const pending: Array<{ resolve: () => void; reject: () => void }> = [];
    const request = (query: DataTableQuery) =>
      new Promise<Response>((resolve, reject) => {
        pending.push({
          resolve: () =>
            resolve({
              items: [{ id: query.sort?.direction === 'descending' ? 95 : 1, name: 'Result', locked: false }],
              total: 95,
              page: query.page,
              pageSize: query.pageSize,
              sort: query.sort,
            }),
          reject: () => reject(new Error('Request failed')),
        });
      });
    render(<ServerPaginationExample request={request} />);
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    await act(async () => pending[1]!.resolve());
    expect(screen.getByRole('checkbox', { name: 'Select 95' })).toBeInTheDocument();
    await act(async () => {
      if (outcome === 'success') pending[0]!.resolve();
      else pending[0]!.reject();
    });
    expect(screen.getByRole('checkbox', { name: 'Select 95' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Select 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'descending');
  },
);

it('server pagination example restores the latest confirmed sort when a request fails before rerender', async () => {
  const confirmed = {
    items: [{ id: 1, name: 'Item 1', locked: false }],
    total: 95,
    page: 1,
    pageSize: 20,
    sort: { columnId: 'name', direction: 'ascending' as const },
  };
  let confirm!: () => void;
  let fail!: () => void;
  const request = vi
    .fn<() => Promise<typeof confirmed>>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          confirm = () => resolve(confirmed);
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          fail = () => reject(new Error('Request failed'));
        }),
    );
  render(<ServerPaginationExample request={request} />);
  fireEvent.click(screen.getByRole('button', { name: 'Name' }));
  await act(async () => {
    confirm();
    await Promise.resolve();
    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    fail();
  });
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  expect(screen.getByRole('checkbox', { name: 'Select 1' })).toBeInTheDocument();
});
