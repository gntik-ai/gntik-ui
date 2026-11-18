import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import type { QueryGroup } from '@gntik-ai/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable, type DataTableProps, type DataTableQuery } from './DataTable';
import type { DataTableColumn } from './data-table-utils';

type Row = { id: string; name: string; region: string; tier: string };
const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
  { id: 'region', header: 'Region', accessor: (row) => row.region },
  { id: 'tier', header: 'Tier', accessor: (row) => row.tier },
];
const two: Row[] = [
  { id: 'a', name: 'orders-api', region: 'eu-west-1', tier: 'gold' },
  { id: 'b', name: 'billing-sync', region: 'us-east-1', tier: 'silver' },
];
const many: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `svc-${String(i + 1).padStart(2, '0')}`,
  region: i % 3 === 0 ? 'eu-west-1' : 'us-east-1',
  tier: i % 2 === 0 ? 'gold' : 'silver',
}));
const labels = { rangeSummary: (from: number, to: number, total: number) => `${from}-${to} of ${total}` };
const base = { columns, caption: 'Deployments', labels } satisfies Partial<DataTableProps<Row>>;
const status = () => screen.getByText(/of \d+$/).textContent;

afterEach(() => vi.useRealTimers());

describe('DataTable quick filter (client mode)', () => {
  it('keeps rows where every term matches a column, ignoring case and accents', () => {
    const { rerender } = render(<DataTable {...base} rows={two} quickFilter="orders eu" selectionMode="none" />);
    expect(screen.getByText('orders-api')).toBeInTheDocument();
    expect(screen.queryByText('billing-sync')).not.toBeInTheDocument();
    expect(status()).toBe('1-1 of 1');
    rerender(<DataTable {...base} rows={two} quickFilter="ORDERS" selectionMode="none" />);
    expect(screen.getByText('orders-api')).toBeInTheDocument();
    const accent: Row[] = [{ id: 'f', name: 'Función', region: 'eu', tier: 'x' }, ...two];
    rerender(<DataTable {...base} rows={accent} quickFilter="funcion" selectionMode="none" />);
    expect(screen.getByText('Función')).toBeInTheDocument();
    expect(screen.queryByText('orders-api')).not.toBeInTheDocument();
  });

  it('uses defaultQuickFilter for an uncontrolled start and leaves rows alone without a term', () => {
    const { rerender } = render(<DataTable {...base} rows={two} defaultQuickFilter="billing" selectionMode="none" />);
    expect(screen.queryByText('orders-api')).not.toBeInTheDocument();
    rerender(<DataTable {...base} rows={two} quickFilter="" selectionMode="none" />);
    expect(screen.getByText('orders-api')).toBeInTheDocument();
    expect(screen.getByText('billing-sync')).toBeInTheDocument();
  });

  it('shows page 1 when the term changes on page 3 and counts only matching rows in the footer', () => {
    const { rerender } = render(<DataTable {...base} rows={many} defaultPage={3} selectionMode="none" />);
    expect(status()).toBe('21-30 of 30');
    rerender(<DataTable {...base} rows={many} defaultPage={3} quickFilter="svc" selectionMode="none" />);
    expect(status()).toBe('1-10 of 30');
    rerender(<DataTable {...base} rows={many} defaultPage={3} quickFilter="svc eu-west" selectionMode="none" />);
    expect(status()).toBe('1-10 of 10');
  });

  it('selects only matching rows with the header checkbox and keeps a selected row that stops matching', async () => {
    const onSelectionChange = vi.fn();
    const props = { ...base, rows: two, onSelectionChange };
    const { rerender } = render(<DataTable {...props} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'b']);
    rerender(<DataTable {...props} quickFilter="orders" />);
    expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toBeChecked();
    // Deselect and reselect through the header: only the matching row moves.
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['b']);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    // Reports follow row order.
    expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'b']);
  });

  it('counts matching rows in group headers', () => {
    render(
      <DataTable
        {...base}
        labels={{ ...labels, groupRows: (count: number) => `n=${count}` }}
        rows={many}
        quickFilter="gold"
        groupBy="region"
        selectionMode="none"
      />,
    );
    // Gold rows are the even indexes: 5 in eu-west-1 (every third) and 10 in us-east-1.
    expect(screen.getAllByText(/^n=\d+$/).map((el) => el.textContent)).toEqual(['n=5', 'n=10']);
  });

  it('combines with the filter model using AND', () => {
    const model: QueryGroup = {
      type: 'group',
      id: 'g',
      combinator: 'and',
      children: [{ type: 'condition', id: 'c', field: 'tier', operator: 'eq', value: 'gold' }],
    };
    const rows: Row[] = [...two, { id: 'c', name: 'orders-worker', region: 'us-east-1', tier: 'silver' }];
    render(<DataTable {...base} rows={rows} filterModel={model} quickFilter="orders" selectionMode="none" />);
    expect(screen.getByText('orders-api')).toBeInTheDocument();
    expect(screen.queryByText('orders-worker')).not.toBeInTheDocument();
    expect(screen.queryByText('billing-sync')).not.toBeInTheDocument();
  });

  it('shows noResultsState for an empty result of a non-empty term', () => {
    render(
      <DataTable
        {...base}
        rows={two}
        quickFilter="zzz"
        emptyState={<p>Nothing yet</p>}
        noResultsState={<p>No matches</p>}
      />,
    );
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.queryByText('Nothing yet')).not.toBeInTheDocument();
  });

  it('applies column quickFilter settings', () => {
    const settings: DataTableColumn<Row>[] = [
      { id: 'name', header: 'Name', accessor: (row) => row.name },
      { id: 'region', header: 'Region', accessor: (row) => row.region, quickFilter: false },
      { id: 'tier', header: 'Tier', accessor: (row) => row.tier, defaultHidden: true },
    ];
    const { rerender } = render(
      <DataTable {...base} columns={settings} rows={two} quickFilter="eu-west" selectionMode="none" />,
    );
    expect(screen.queryByText('orders-api')).not.toBeInTheDocument();
    rerender(<DataTable {...base} columns={settings} rows={two} quickFilter="gold" selectionMode="none" />);
    expect(screen.queryByText('orders-api')).not.toBeInTheDocument();
    const optIn = settings.map((c) => (c.id === 'tier' ? { ...c, quickFilter: true as const } : c));
    rerender(<DataTable {...base} columns={optIn} rows={two} quickFilter="gold" selectionMode="none" />);
    expect(screen.getByText('orders-api')).toBeInTheDocument();
  });

  it('renders the default table unchanged without quick filter props', () => {
    const { container } = render(<DataTable {...base} rows={two} />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});

describe('DataTable quick filter (server mode)', () => {
  const server = {
    ...base,
    paginationMode: 'server' as const,
    selectionMode: 'none' as const,
    rows: two,
    rowCount: 95,
    page: 4,
    pageSize: 10,
    showQuickFilter: true,
  };
  const type = (value: string) => fireEvent.change(screen.getByRole('searchbox'), { target: { value } });

  it('renders rows unfiltered and reports the applied term once through every callback', () => {
    vi.useFakeTimers();
    const onQuickFilterChange = vi.fn();
    const onQueryChange = vi.fn<(query: DataTableQuery) => void>();
    const onPageChange = vi.fn();
    render(
      <DataTable
        {...server}
        onQuickFilterChange={onQuickFilterChange}
        onQueryChange={onQueryChange}
        onPageChange={onPageChange}
      />,
    );
    type('eu');
    expect(onQuickFilterChange).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(300));
    expect(onQuickFilterChange).toHaveBeenCalledTimes(1);
    expect(onQuickFilterChange).toHaveBeenCalledWith('eu');
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange.mock.calls[0]![0]).toMatchObject({ quickFilter: 'eu', cause: 'quickFilter', page: 1 });
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('billing-sync')).toBeInTheDocument();
  });

  it('does not request page 1 when the table is already on it', () => {
    vi.useFakeTimers();
    const onPageChange = vi.fn();
    render(<DataTable {...server} page={1} onPageChange={onPageChange} />);
    type('eu');
    act(() => void vi.advanceTimersByTime(300));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('emits no query when the controlled quickFilter prop changes', () => {
    const onQueryChange = vi.fn();
    const onQuickFilterChange = vi.fn();
    const { rerender } = render(
      <DataTable {...server} quickFilter="" onQueryChange={onQueryChange} onQuickFilterChange={onQuickFilterChange} />,
    );
    rerender(
      <DataTable
        {...server}
        quickFilter="eu"
        onQueryChange={onQueryChange}
        onQuickFilterChange={onQuickFilterChange}
      />,
    );
    expect(onQueryChange).not.toHaveBeenCalled();
    expect(onQuickFilterChange).not.toHaveBeenCalled();
  });
});

describe('DataTable built-in quick filter field', () => {
  const setup = (
    props: Partial<Pick<DataTableProps<Row>, 'rows' | 'labels' | 'quickFilterDebounceMs'>> & {
      selectionMode?: 'none' | 'multiple';
    } = {},
  ) => {
    const onQuickFilterChange = vi.fn();
    const utils = render(
      <DataTable {...base} rows={many} showQuickFilter onQuickFilterChange={onQuickFilterChange} {...props} />,
    );
    return { onQuickFilterChange, ...utils };
  };
  const field = () => screen.getByRole('searchbox', { name: 'Search Deployments' });

  it('applies typing once, 300 ms after the last key', () => {
    vi.useFakeTimers();
    const { onQuickFilterChange } = setup({ selectionMode: 'none' });
    for (const text of ['o', 'or', 'ord']) {
      fireEvent.change(field(), { target: { value: text } });
      act(() => void vi.advanceTimersByTime(100));
    }
    expect(onQuickFilterChange).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(199));
    expect(onQuickFilterChange).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(onQuickFilterChange).toHaveBeenCalledTimes(1);
    expect(onQuickFilterChange).toHaveBeenCalledWith('ord');
  });

  it('honours quickFilterDebounceMs', () => {
    vi.useFakeTimers();
    const { onQuickFilterChange } = setup({ quickFilterDebounceMs: 50, selectionMode: 'none' });
    fireEvent.change(field(), { target: { value: 'svc' } });
    act(() => void vi.advanceTimersByTime(50));
    expect(onQuickFilterChange).toHaveBeenCalledWith('svc');
  });

  it('applies at once on Enter and clears at once on Escape', () => {
    vi.useFakeTimers();
    const { onQuickFilterChange } = setup({ selectionMode: 'none' });
    fireEvent.change(field(), { target: { value: 'svc' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onQuickFilterChange).toHaveBeenCalledTimes(1);
    expect(onQuickFilterChange).toHaveBeenLastCalledWith('svc');
    act(() => void vi.advanceTimersByTime(300));
    expect(onQuickFilterChange).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field()).toHaveValue('');
    expect(onQuickFilterChange).toHaveBeenCalledTimes(2);
    expect(onQuickFilterChange).toHaveBeenLastCalledWith('');
  });

  it('filters rows by the applied term and never by keystrokes', () => {
    vi.useFakeTimers();
    setup({ selectionMode: 'none' });
    fireEvent.change(field(), { target: { value: 'svc-07' } });
    expect(screen.getAllByRole('row')).toHaveLength(11);
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('stays rendered with its text and focus while rows are selected', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(field(), 'svc-0{Enter}');
    expect(field()).toHaveFocus();
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(field()).toHaveValue('svc-0');
    expect(field()).toBeInTheDocument();
    await user.click(field());
    expect(field()).toHaveFocus();
    expect(screen.getByText('9 selected')).toBeInTheDocument();
  });

  it('announces the match count after a term applies, not while typing', () => {
    vi.useFakeTimers();
    setup({ rows: two, selectionMode: 'none' });
    const announcement = () => screen.getByRole('status').textContent;
    fireEvent.change(field(), { target: { value: 'e' } });
    expect(announcement()).toBe('');
    act(() => void vi.advanceTimersByTime(300));
    expect(announcement()).toBe('2 rows match');
    fireEvent.change(field(), { target: { value: 'eu' } });
    expect(announcement()).toBe('2 rows match');
    act(() => void vi.advanceTimersByTime(300));
    expect(announcement()).toBe('1 row matches');
  });

  it('localizes the name and the count', () => {
    vi.useFakeTimers();
    render(
      <I18nProvider locale="es">
        <DataTable {...base} rows={two} showQuickFilter selectionMode="none" />
      </I18nProvider>,
    );
    const input = screen.getByRole('searchbox', { name: 'Buscar en Deployments' });
    fireEvent.change(input, { target: { value: 'e' } });
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByText('2 filas coinciden')).toBeInTheDocument();
  });

  it('takes its name and count text from labels', () => {
    vi.useFakeTimers();
    setup({
      rows: two,
      selectionMode: 'none',
      labels: {
        ...labels,
        quickFilter: (caption: string) => `Find in ${caption}`,
        quickFilterResults: (n: number) => `${n} hits`,
      },
    });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Find in Deployments' }), { target: { value: 'e' } });
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByText('2 hits')).toBeInTheDocument();
  });

  it('follows a controlled term set and cleared from outside, even back to the earlier value', () => {
    const onQuickFilterChange = vi.fn();
    const props = { ...base, rows: many, showQuickFilter: true, onQuickFilterChange };
    const { rerender } = render(<DataTable {...props} quickFilter="" />);
    rerender(<DataTable {...props} quickFilter="svc-01" />);
    expect(field()).toHaveValue('svc-01');
    rerender(<DataTable {...props} quickFilter="" />);
    expect(field()).toHaveValue('');
    expect(onQuickFilterChange).not.toHaveBeenCalled();
  });

  it('drops a pending typed term when the controlled term is replaced from outside', () => {
    vi.useFakeTimers();
    const onQuickFilterChange = vi.fn();
    const onQueryChange = vi.fn();
    const props = { ...base, rows: many, showQuickFilter: true, onQuickFilterChange, onQueryChange };
    const { rerender } = render(<DataTable {...props} quickFilter="" />);
    fireEvent.change(field(), { target: { value: 'ord' } });
    act(() => void vi.advanceTimersByTime(100));
    rerender(<DataTable {...props} quickFilter="svc-01" />);
    act(() => void vi.advanceTimersByTime(500));
    expect(field()).toHaveValue('svc-01');
    expect(onQuickFilterChange).not.toHaveBeenCalled();
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = setup({ rows: two });
    await expectNoAxeViolations(container);
  });
});

describe('DataTable collapsible quick filter', () => {
  const button = () => screen.getByRole('button', { name: 'Search Deployments' });

  it('shows only a collapsed button, expands to a focused field and collapses on Escape in the empty field', async () => {
    const user = userEvent.setup();
    render(<DataTable {...base} rows={two} showQuickFilter="collapsible" selectionMode="none" />);
    expect(button()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    await user.click(button());
    const input = screen.getByRole('searchbox', { name: 'Search Deployments' });
    expect(input).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(button()).toHaveFocus();
    expect(button()).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the field open while a term is set, and collapses only once it is empty', async () => {
    const user = userEvent.setup();
    render(
      <DataTable {...base} rows={two} showQuickFilter="collapsible" defaultQuickFilter="orders" selectionMode="none" />,
    );
    const input = screen.getByRole('searchbox', { name: 'Search Deployments' });
    expect(input).toHaveValue('orders');
    expect(screen.queryByRole('button', { name: 'Search Deployments' })).not.toBeInTheDocument();
    input.focus();
    // The first Escape clears the term and keeps the field; the second one collapses it.
    await user.keyboard('{Escape}');
    expect(screen.getByRole('searchbox', { name: 'Search Deployments' })).toHaveValue('');
    expect(screen.getByRole('searchbox', { name: 'Search Deployments' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(button()).toHaveFocus();
  });

  it('has no axe violations collapsed or expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<DataTable {...base} rows={two} showQuickFilter="collapsible" />);
    await expectNoAxeViolations(container);
    await user.click(button());
    await expectNoAxeViolations(container);
  });
});
