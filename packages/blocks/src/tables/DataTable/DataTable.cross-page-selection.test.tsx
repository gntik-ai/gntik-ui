import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable } from './DataTable';
import ClientSelectionExample from './examples/client-selection';
import PaginatedSingleSelectionExample from './examples/paginated-single-selection';
import ServerPaginationExample from './examples/server-pagination';

const rows = Array.from({ length: 95 }, (_, index) => ({ id: String(index + 1), name: `Item ${index + 1}` }));
const columns = [{ id: 'name', header: 'Name', accessor: (row: (typeof rows)[number]) => row.name, sortable: true }];
const server = { paginationMode: 'server' as const, rowCount: 95, page: 1, pageSize: 20, columns };

it.each(['dark', 'light', 'high_contrast'] as const)('has accessible example semantics in %s', async (theme) => {
  const user = userEvent.setup();
  for (const Example of [ServerPaginationExample, ClientSelectionExample, PaginatedSingleSelectionExample]) {
    const { container, unmount } = render(
      <ThemeProvider defaultMode={theme} storageKey={null}>
        <Example />
      </ThemeProvider>,
    );
    await act(async () => {});
    await expectNoAxeViolations(container);
    if (Example !== PaginatedSingleSelectionExample) {
      await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
      await user.click(
        screen.getByRole('button', {
          name: Example === ServerPaginationExample ? 'Select all 95 rows' : 'Select all 94 rows',
        }),
      );
      await expectNoAxeViolations(container);
    }
    unmount();
  }
});

it('keeps server selections in reporting and a bulk action on another page', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const act = vi.fn();
  const props = {
    ...server,
    onSelectionChange,
    bulkActions: (ids: string[]) => <button onClick={() => act(ids)}>Apply</button>,
  };
  const { rerender } = render(<DataTable {...props} rows={rows.slice(0, 20)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 1' }));
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 2' }));
  rerender(<DataTable {...props} rows={rows.slice(20, 40)} page={2} />);
  expect(screen.getByText('2 selected')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  expect(act).toHaveBeenLastCalledWith(['1', '2']);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 21' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2', '21']);
  expect(screen.getByText('3 selected')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  expect(act).toHaveBeenLastCalledWith(['1', '2', '21']);
});

it('opts out of server preservation', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const props = { ...server, preserveSelection: false, onSelectionChange };
  const { rerender } = render(<DataTable {...props} rows={rows.slice(0, 20)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 1' }));
  rerender(<DataTable {...props} rows={rows.slice(20, 40)} page={2} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 21' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['21']);
  expect(screen.getByText('1 selected')).toBeInTheDocument();
});

it.each([false, true])('client preservation=%s reports removed rows only when opted in', async (preserveSelection) => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const props = { columns, preserveSelection, onSelectionChange };
  const { rerender } = render(<DataTable {...props} rows={rows.slice(0, 2)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 1' }));
  rerender(<DataTable {...props} rows={rows.slice(1, 3)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 2' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(preserveSelection ? ['1', '2'] : ['2']);
});

it('selects every matching client row and retains the strip button and focus when clearing', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  render(<DataTable rows={rows} columns={columns} selectAllMatching onSelectionChange={onSelectionChange} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  expect(screen.getByText('All 10 rows on this page are selected.')).toHaveAttribute('aria-live', 'polite');
  const button = screen.getByRole('button', { name: 'Select all 95 rows' });
  await user.click(button);
  expect(onSelectionChange.mock.lastCall?.[0]).toHaveLength(95);
  expect(onSelectionChange.mock.lastCall?.[0]).toContain('95');
  expect(screen.getByText('All 95 rows are selected.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Clear selection' })).toBe(button);
  expect(button).toHaveFocus();
  await user.click(button);
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  expect(screen.queryByText('All 95 rows are selected.')).not.toBeInTheDocument();
});

it('reports an exclude model, keeps it through paging, sizing and sorting, and clears only on changed filters', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const onSelectionModelChange = vi.fn();
  const act = vi.fn();
  const props = {
    ...server,
    selectAllMatching: true,
    onSelectionChange,
    onSelectionModelChange,
    filters: { status: 'failed' },
    bulkActions: (ids: string[], model: import('./data-table-utils').DataTableSelectionModel) => (
      <button onClick={() => act(ids, model)}>Apply</button>
    ),
  };
  const { rerender } = render(<DataTable {...props} rows={rows.slice(0, 20)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  await user.click(screen.getByRole('button', { name: 'Select all 95 rows' }));
  expect(onSelectionModelChange).toHaveBeenLastCalledWith({ type: 'exclude', ids: [] });
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 3' }));
  expect(onSelectionModelChange).toHaveBeenLastCalledWith({ type: 'exclude', ids: ['3'] });
  expect(screen.getByText('94 selected')).toBeInTheDocument();
  expect(screen.getByText('All 94 rows are selected.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  expect(act).toHaveBeenLastCalledWith(expect.not.arrayContaining(['3']), { type: 'exclude', ids: ['3'] });
  onSelectionChange.mockClear();
  onSelectionModelChange.mockClear();
  rerender(<DataTable {...props} rows={rows.slice(20, 40)} page={2} filters={{ status: 'failed' }} />);
  rerender(
    <DataTable
      {...props}
      rows={rows.slice(40, 50)}
      page={5}
      pageSize={10}
      sort={{ columnId: 'name', direction: 'descending' }}
    />,
  );
  expect(onSelectionChange).not.toHaveBeenCalled();
  expect(onSelectionModelChange).not.toHaveBeenCalled();
  expect(screen.getByText('94 selected')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
  rerender(<DataTable {...props} rows={rows.slice(40, 50)} filters={{ status: 'paused' }} />);
  expect(onSelectionModelChange).toHaveBeenLastCalledWith({ type: 'include', ids: [] });
  expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  expect(screen.queryByText('94 selected')).not.toBeInTheDocument();
});

it('retains legacy client checkbox state when removed rows return, while reporting only supplied rows', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const props = { columns, onSelectionChange };
  const { rerender } = render(<DataTable {...props} rows={rows.slice(0, 2)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 1' }));
  rerender(<DataTable {...props} rows={rows.slice(1, 3)} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 2' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['2']);
  rerender(<DataTable {...props} rows={rows.slice(0, 3)} />);
  expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 3' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2', '3']);
});

it('requires a model callback for the server strip and warns in development only', async () => {
  vi.stubEnv('NODE_ENV', 'development');
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const user = userEvent.setup();
    const { unmount } = render(<DataTable {...server} rows={rows.slice(0, 20)} selectAllMatching />);
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.queryByRole('button', { name: 'Select all 95 rows' })).not.toBeInTheDocument();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('onSelectionModelChange'));
    warning.mockClear();
    unmount();
    vi.stubEnv('NODE_ENV', 'production');
    render(<DataTable {...server} rows={rows.slice(0, 20)} selectAllMatching />);
    expect(warning).not.toHaveBeenCalled();
  } finally {
    warning.mockRestore();
    vi.unstubAllEnvs();
  }
});

it('gives a controlled model precedence over selectedIds and waits for its consumer', async () => {
  const user = userEvent.setup();
  const onSelectionModelChange = vi.fn();
  const props = { rows: rows.slice(0, 3), columns, selectedIds: ['1'], onSelectionModelChange };
  const { rerender } = render(<DataTable {...props} selectionModel={{ type: 'include', ids: ['2'] }} />);
  expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Select Item 2' })).toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 3' }));
  expect(onSelectionModelChange).toHaveBeenLastCalledWith({ type: 'include', ids: ['2', '3'] });
  expect(screen.getByRole('checkbox', { name: 'Select Item 3' })).not.toBeChecked();
  rerender(<DataTable {...props} selectionModel={{ type: 'include', ids: ['2', '3'] }} />);
  expect(screen.getByRole('checkbox', { name: 'Select Item 3' })).toBeChecked();
});

it('continues to support controlled selectedIds with a one-argument bulk action', async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  const { rerender } = render(
    <DataTable
      rows={rows.slice(0, 3)}
      columns={columns}
      selectedIds={['1']}
      onSelectionChange={onSelectionChange}
      bulkActions={(ids) => <span>Act on {ids.join(',')}</span>}
    />,
  );
  await user.click(screen.getByRole('checkbox', { name: 'Select Item 2' }));
  expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2']);
  expect(screen.getByText('Act on 1')).toBeInTheDocument();
  rerender(<DataTable rows={rows.slice(0, 3)} columns={columns} selectedIds={['1', '2']} />);
  expect(screen.getByText('2 selected')).toBeInTheDocument();
});
