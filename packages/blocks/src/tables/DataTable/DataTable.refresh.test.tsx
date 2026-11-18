import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable, type DataTableProps } from './DataTable';
import type { DataTableColumn } from './data-table-utils';
import RefreshLoadingExample from './examples/refresh-loading';
import { generateDeployments } from './fixtures';

type Row = { id: number; name: string };
const rows: Row[] = Array.from({ length: 20 }, (_, i) => ({ id: 21 + i, name: `Item ${21 + i}` }));
const columns: DataTableColumn<Row>[] = [
  { id: 'id', header: 'Id', accessor: (row) => row.id, sortable: true },
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
];
const server: DataTableProps<Row> = {
  paginationMode: 'server',
  rows,
  columns,
  caption: 'Deployments',
  page: 2,
  pageSize: 20,
  rowCount: 95,
  pageSizeOptions: [10, 20, 50],
  rowActions: (row) => [{ label: `Inspect ${row.id}` }],
};
const isDisabled = (el: HTMLElement) =>
  el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('data-disabled');
// Generated ids differ between two mounts; everything else must match.
const stable = (html: string) => html.replace(/_r_[a-z0-9]+_/g, '_r_');
const bodyRows = () => screen.getAllByRole('row').slice(1);
const rowTexts = () => bodyRows().map((row) => row.textContent);

describe('DataTable loading="refresh"', () => {
  it('keeps rows, footer and header checkbox, and signals the refresh without moving anything', () => {
    const { container, rerender } = render(<DataTable {...server} loading={false} />);
    const before = rowTexts();
    const rowCountBefore = screen.getAllByRole('row').length;
    rerender(<DataTable {...server} loading="refresh" />);
    expect(rowTexts()).toEqual(before);
    expect(screen.getAllByRole('row')).toHaveLength(rowCountBefore);
    expect(screen.getByRole('navigation', { name: 'Deployments pagination' })).toBeInTheDocument();
    expect(isDisabled(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))).toBe(false);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    const bar = screen.getByRole('progressbar');
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAccessibleName('Updating deployments…');
    // Overlay: it lives at the top of the body, before every row, and takes no layout space.
    const table = screen.getByRole('table');
    const indicator = table.querySelector('[data-refresh-indicator]')!;
    expect(indicator.contains(bar)).toBe(true);
    expect(indicator.nextElementSibling).toBe(table.querySelector('tbody:not([data-refresh-indicator])'));
    expect(bar).toHaveClass('absolute');
    expect(bar.closest('tr')).toHaveClass('h-0');
    expect(container.querySelector('[data-slot="skeleton"], .animate-pulse:not([data-indeterminate])')).toBeNull();
    for (const row of bodyRows()) expect(row.className).not.toMatch(/opacity/);
  });

  it('removes the indicator and aria-busy when the refresh ends', () => {
    const { rerender } = render(<DataTable {...server} loading="refresh" />);
    rerender(<DataTable {...server} loading={false} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy');
  });

  it('announces Updating after a table-emitted page request, not for a caller-only poll', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(<DataTable {...server} loading={false} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    rerender(<DataTable {...server} loading="refresh" onPageChange={onPageChange} />);
    expect(screen.getByRole('status')).toHaveTextContent('Updating deployments…');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    rerender(<DataTable {...server} loading={false} onPageChange={onPageChange} />);
    expect(screen.queryByRole('status')).toBeNull();
    // A poll: nothing the table emitted since the last refresh.
    rerender(<DataTable {...server} loading="refresh" onPageChange={onPageChange} />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('still announces a refresh that arrives long after the table-emitted request', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      const user = userEvent.setup({ advanceTimers: () => {} });
      const { rerender } = render(<DataTable {...server} loading={false} onPageChange={() => {}} />);
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      vi.setSystemTime(Date.now() + 5001);
      rerender(<DataTable {...server} loading="refresh" onPageChange={() => {}} />);
      expect(screen.getByRole('status')).toHaveTextContent('Updating deployments…');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not announce a refresh present on mount', () => {
    render(<DataTable {...server} loading="refresh" />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('announces after a sort request and uses the labels.updating override', async () => {
    const user = userEvent.setup();
    const labels = {
      updating: (caption: string) => `Refreshing ${caption}`,
    } as unknown as DataTableProps<Row>['labels'];
    const { rerender } = render(<DataTable {...server} labels={labels} onSortChange={() => {}} loading={false} />);
    await user.click(screen.getByRole('button', { name: /Name/ }));
    rerender(<DataTable {...server} labels={labels} onSortChange={() => {}} loading="refresh" />);
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing Deployments');
  });

  it('announces a request made while a silent refresh is already running', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DataTable {...server} loading="refresh" onPageChange={() => {}} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    rerender(<DataTable {...server} loading="refresh" onPageChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Updating deployments…');
  });

  it('localizes the Updating status', async () => {
    const user = userEvent.setup();
    const ui = (loading: boolean | 'refresh') => (
      <I18nProvider locale="es">
        <DataTable {...server} loading={loading} onPageChange={() => {}} />
      </I18nProvider>
    );
    const { rerender } = render(ui(false));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    rerender(ui('refresh'));
    expect(screen.getByRole('status')).toHaveTextContent('Actualizando deployments…');
  });

  it('renders refresh with no rows exactly like loading={true}', () => {
    const empty = { ...server, rows: [] };
    const skeleton = render(<DataTable {...empty} loading />);
    const expected = stable(skeleton.container.innerHTML);
    skeleton.unmount();
    const refresh = render(<DataTable {...empty} loading="refresh" />);
    expect(stable(refresh.container.innerHTML)).toBe(expected);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Loading deployments…');
  });

  it('keeps controls usable during a refresh', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const onPageChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <DataTable
        {...server}
        loading="refresh"
        onSelectionChange={onSelectionChange}
        onPageChange={onPageChange}
        rowActions={(row) => [{ label: `Inspect ${row.id}`, onSelect }]}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Select 21' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['21']);
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole('button', { name: 'Actions for 21' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Inspect 21' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(isDisabled(screen.getByRole('button', { name: 'Next page' }))).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('keeps single selection rows rendered and selectable', async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();
    render(
      <DataTable
        {...server}
        selectionMode="single"
        selectionName="pick"
        legend="Pick one"
        paginated={false}
        loading="refresh"
        onSelectedIdChange={onSelectedIdChange}
      />,
    );
    await user.click(screen.getAllByRole('radio')[1]!);
    expect(onSelectedIdChange).toHaveBeenCalledWith('22');
  });

  it('keeps the virtual window, aria-rowcount and scroll position', () => {
    const data = generateDeployments(1000);
    const { container, rerender } = render(<DataTable rows={data} paginated={false} loading={false} />);
    const scroller = screen.getByRole('table').parentElement!;
    act(() => {
      scroller.scrollTop = 44 * 300;
      fireEvent.scroll(scroller);
    });
    const firstIndex = () =>
      container
        .querySelector('tbody:not([data-virtual-spacer]):not([data-refresh-indicator]) tr')
        ?.getAttribute('aria-rowindex');
    const before = firstIndex();
    rerender(<DataTable rows={data} paginated={false} loading="refresh" />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '1001');
    expect(screen.getByRole('table')).toHaveAttribute('data-virtualized', 'true');
    expect(firstIndex()).toBe(before);
    expect(scroller.scrollTop).toBe(44 * 300);
  });

  it('keeps loading={true} behaviour: skeleton rows, no footer, Loading status', () => {
    render(<DataTable {...server} caption="Items" loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading items…');
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(isDisabled(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))).toBe(true);
  });

  it('does not animate the indicator under reduced motion', () => {
    render(<DataTable {...server} loading="refresh" />);
    const indicator = [...screen.getByRole('progressbar').querySelectorAll('[data-indeterminate]')].at(-1)!;
    expect(indicator.className).toContain('data-[indeterminate]:animate-pulse');
    expect(indicator.className).toContain('motion-reduce:data-[indeterminate]:animate-none');
  });
});

describe('DataTable filtered empty states', () => {
  const empty = { ...server, rows: [] };
  const states = {
    emptyState: <p>Nothing yet</p>,
    noResultsState: <p>No matches</p>,
  };

  it('shows noResultsState when filtered', () => {
    render(<DataTable {...empty} {...states} filtered />);
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.queryByText('Nothing yet')).toBeNull();
  });

  it('falls back to emptyState, then the default, when filtered without noResultsState', () => {
    const { rerender } = render(<DataTable {...empty} emptyState={<p>Nothing yet</p>} filtered />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    rerender(<DataTable {...empty} filtered />);
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
    expect(screen.getByText('Nothing matches the current filters.')).toBeInTheDocument();
  });

  it('shows emptyState when filtered is false or unset', () => {
    const { rerender } = render(<DataTable {...empty} {...states} filtered={false} />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(screen.queryByText('No matches')).toBeNull();
    rerender(<DataTable {...empty} {...states} />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
  });

  it('keeps the default empty state when neither prop is set', () => {
    render(<DataTable {...empty} />);
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
    expect(screen.getByText('Nothing matches the current filters.')).toBeInTheDocument();
  });
});

describe('refresh-loading example', () => {
  it('takes every visible and accessible string from the catalog', () => {
    render(
      <I18nProvider locale="es">
        <RefreshLoadingExample pollMs={0} latencyMs={0} />
      </I18nProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Buscar despliegues' })).toHaveAttribute(
      'placeholder',
      'Buscar despliegues',
    );
    expect(screen.getByRole('checkbox', { name: 'Espacio de trabajo vacío' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Solicitudes/ })).toBeInTheDocument();
  });

  it('keeps rows while the next page loads, announces it and shows the empty states', async () => {
    const user = userEvent.setup();
    const { container } = render(<RefreshLoadingExample pollMs={0} latencyMs={600} />);
    await user.click(await screen.findByRole('button', { name: 'Next page' }));
    expect(await screen.findByText('Updating deployments…')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(bodyRows().length).toBe(10);
    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
    await user.type(screen.getByRole('textbox', { name: 'Search deployments' }), 'zzz');
    expect(await screen.findByText(/zzz/)).toBeInTheDocument();
    await user.clear(screen.getByRole('textbox', { name: 'Search deployments' }));
    await user.click(screen.getByRole('checkbox', { name: 'Empty workspace' }));
    expect(await screen.findByRole('heading', { name: /first/i })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
