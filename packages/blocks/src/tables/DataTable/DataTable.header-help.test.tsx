import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { Gauge } from '@gntik-ai/icons';
import { DataTable } from './DataTable';
import HeaderHelp from './examples/header-help';
import { expectNoAxeViolations } from '../../test/a11y';

const rows = [{ id: 'a', latency: 24 }];
const description = '95th percentile of request latency in the period.';

// Public seam: rendered DataTable headers, user keyboard actions and sorting callbacks.
describe('DataTable header help', () => {
  it.each([false, true])('preserves plain header DOM (resizable=%s)', (resizable) => {
    render(
      <DataTable
        rows={rows}
        columns={[{ id: 'latency', header: 'Latency', sortable: true }]}
        selectionMode="none"
        resizable={resizable}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /Latency/ }).outerHTML).toMatchSnapshot();
  });
  it.each([false, true])('keeps help outside the sort button (resizable=%s)', async (resizable) => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={[{ id: 'p95', header: 'p95 latency', sortable: true, description }]}
        selectionMode="none"
        resizable={resizable}
        onSortChange={onSortChange}
      />,
    );
    const header = screen.getByRole('columnheader', { name: 'p95 latency' });
    const sort = within(header).getByRole('button', { name: 'p95 latency' });
    const info = within(header).getByRole('button', { name: 'More information about p95 latency' });
    expect(header.querySelector('button button')).toBeNull();
    expect(sort.parentElement).toBe(info.parentElement);
    sort.focus();
    await user.tab();
    expect(info).toHaveFocus();
    for (const key of ['{Enter}', ' ']) {
      await user.keyboard(key);
      const dialog = await screen.findByRole('dialog', { name: 'p95 latency' });
      expect(dialog).toHaveTextContent(description);
      expect(header).not.toContainElement(dialog);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(info).toHaveFocus();
    }
    expect(onSortChange).not.toHaveBeenCalled();
    expect(header).toHaveAttribute('aria-sort', 'none');
    if (resizable) {
      const separator = screen.getByRole('separator', { name: 'Resize p95 latency column' });
      expect(separator.parentElement).toBe(info.parentElement);
      await user.tab();
      expect(separator).toHaveFocus();
    }
  });
});

const renderHeader = () => (
  <>
    <Gauge aria-hidden data-testid="latency-icon" />
    Latency <span>(ms)</span>
  </>
);

describe('DataTable rich headers', () => {
  it.each([
    { resizable: false, help: false },
    { resizable: true, help: false },
    { resizable: false, help: true },
    { resizable: true, help: true },
  ])('keeps plain names and sorting with %j', async ({ resizable, help }) => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={[
          {
            id: 'latency',
            header: 'Latency',
            accessor: (row) => row.latency,
            sortable: true,
            editable: true,
            renderHeader,
            description: help ? description : undefined,
          },
        ]}
        resizable={resizable}
        selectionMode="none"
        onSortChange={onSortChange}
        onCellEdit={vi.fn()}
        getRowLabel={() => 'Sample'}
      />,
    );
    const header = screen.getByRole('columnheader', { name: 'Latency' });
    expect(within(header).getByText('(ms)')).toBeVisible();
    expect(within(header).getByTestId('latency-icon')).toBeVisible();
    expect(within(header).getByTestId('latency-icon')).toHaveAttribute('aria-hidden', 'true');
    await user.click(within(header).getByRole('button', { name: 'Latency (ms)' }));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'latency', direction: 'ascending' });
    if (resizable) expect(screen.getByRole('separator', { name: 'Resize Latency column' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Latency' })).toHaveTextContent(/^Latency$/);
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: '24' }));
    expect(screen.getByRole('textbox', { name: 'Latency for Sample' })).toBeVisible();
  });

  it.each(['not-sortable', 'server-disabled'])('renders plain rich content with sorting %s', (mode) => {
    const columns = [{ id: 'latency', header: 'Latency', sortable: mode !== 'not-sortable', renderHeader }];
    render(
      mode === 'server-disabled' ? (
        <DataTable
          rows={rows}
          columns={columns}
          selectionMode="none"
          paginationMode="server"
          page={1}
          pageSize={20}
          rowCount={1}
        />
      ) : (
        <DataTable rows={rows} columns={columns} selectionMode="none" />
      ),
    );
    const header = screen.getByRole('columnheader', { name: 'Latency' });
    expect(within(header).getByText('(ms)')).toBeVisible();
    expect(within(header).queryByRole('button')).not.toBeInTheDocument();
    expect(header).not.toHaveAttribute('aria-sort');
  });
});

describe('DataTable header help layout and locale', () => {
  it.each(['left', 'center', 'right'] as const)(
    'keeps control order for %s aligned pinned, virtualized headers',
    async (align) => {
      const user = userEvent.setup();
      const onColumnWidthsChange = vi.fn();
      const { container } = render(
        <DataTable
          rows={Array.from({ length: 100 }, (_, index) => ({ id: String(index), latency: index }))}
          columns={[
            { id: 'id', header: 'ID', accessor: (row) => row.id, width: 80 },
            {
              id: 'latency',
              header: 'Latency',
              accessor: (row) => row.latency,
              sortable: true,
              description,
              renderHeader,
              align,
              headClassName: 'font-semibold',
            },
          ]}
          selectionMode="none"
          paginated={false}
          virtualize
          resizable
          defaultPinnedColumns={{ left: ['id', 'latency'] }}
          onColumnWidthsChange={onColumnWidthsChange}
        />,
      );
      expect(screen.getByRole('table')).toHaveAttribute('data-virtualized', 'true');
      const header = screen.getByRole('columnheader', { name: 'Latency' });
      expect(header).toHaveClass('sticky', 'z-sticky-pinned', 'border-e', 'bg-card', 'font-semibold');
      expect(header).toHaveStyle({ width: '160px', insetInlineStart: '80px' });
      const [sort, info] = within(header).getAllByRole('button');
      sort!.focus();
      await user.tab();
      expect(info).toHaveFocus();
      await user.keyboard('{Enter}');
      const dialog = await screen.findByRole('dialog', { name: 'Latency' });
      expect(container).not.toContainElement(dialog);
      expect(dialog.closest('.z-popover')).not.toBeNull();
      await user.keyboard('{Escape}');
      await waitFor(() => expect(info).toHaveFocus());
      await user.tab();
      const separator = screen.getByRole('separator', { name: 'Resize Latency column' });
      expect(separator).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(onColumnWidthsChange).toHaveBeenLastCalledWith({ latency: 170 });
      expect(header).toHaveStyle({ width: '170px', insetInlineStart: '80px' });
    },
  );
});

it('reuses the Spanish info button catalog entry', () => {
  render(
    <I18nProvider locale="es">
      <DataTable rows={rows} columns={[{ id: 'p95', header: 'p95 latency', description }]} selectionMode="none" />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Más información sobre p95 latency' })).toBeVisible();
});

it.each(['dark', 'light', 'high_contrast'])('header help example has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme;
  const user = userEvent.setup();
  render(<HeaderHelp />);
  expect(screen.getByRole('columnheader', { name: 'p95 latency' })).toHaveTextContent('(ms)');
  await expectNoAxeViolations();
  for (const label of ['p95 latency', 'Tokens', 'Cost']) {
    await user.click(screen.getByRole('button', { name: `More information about ${label}` }));
    await screen.findByRole('dialog', { name: label });
    await expectNoAxeViolations();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  }
});
