import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable } from './DataTable';
import { orderColumns, setColumnPin, tableLayout } from './column-sizing';
import ResizablePinnedDataTable from './examples/resizable-pinned';
import VirtualizedDataTable from './examples/virtualized';
import { DEPLOYMENT_COLUMNS, generateDeployments } from './fixtures';
import { windowFor } from './use-virtual-rows';

const head = (name: RegExp) => screen.getByRole('columnheader', { name });

describe('DataTable column resize', () => {
  it('exposes a focusable separator per column and resizes from the keyboard', async () => {
    const user = userEvent.setup();
    const onColumnWidthsChange = vi.fn();
    const { container } = render(<DataTable resizable onColumnWidthsChange={onColumnWidthsChange} />);
    const handle = screen.getByRole('separator', { name: 'Resize Region column' });
    expect(handle).toHaveAttribute('aria-valuenow', '160');
    expect(handle).toHaveAttribute('aria-valuemin', '60');
    expect(handle).toHaveAttribute('aria-valuemax', '640');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '170');
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(handle).toHaveAttribute('aria-valuenow', '120');
    await user.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{End}');
    expect(onColumnWidthsChange).toHaveBeenLastCalledWith({ region: 640 });
    expect(head(/Region/)).toHaveStyle({ width: '640px' });
    expect(screen.getByRole('table')).toHaveClass('table-fixed');
    // The sort button and the handle are siblings, never nested.
    expect(within(head(/Cost/)).getByRole('button', { name: /Cost/ })).not.toContainElement(screen.getByRole('separator', { name: 'Resize Cost column' }));
    await expectNoAxeViolations(container);
  });

  it('resizes with a pointer drag and respects column limits', () => {
    const columns = DEPLOYMENT_COLUMNS.map((c) => (c.id === 'name' ? { ...c, width: 200, maxWidth: 260 } : c));
    render(<DataTable resizable columns={columns} />);
    const handle = screen.getByRole('separator', { name: 'Resize Deployment column' });
    expect(handle).toHaveAttribute('aria-valuenow', '200');
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 140, pointerId: 1 });
    expect(handle).toHaveAttribute('aria-valuenow', '240');
    fireEvent.pointerMove(handle, { clientX: 400, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 400, pointerId: 1 });
    expect(handle).toHaveAttribute('aria-valuenow', '260');
  });

  it('follows controlled widths and keeps sortable headers working', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<DataTable resizable columnWidths={{ cost: 120 }} onSortChange={onSortChange} />);
    const handle = screen.getByRole('separator', { name: 'Resize Cost column' });
    expect(handle).toHaveAttribute('aria-valuenow', '120');
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '120');
    await user.click(screen.getByRole('button', { name: /Cost/ }));
    expect(head(/Cost/)).toHaveAttribute('aria-sort', 'ascending');
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'cost', direction: 'ascending' });
  });
});

describe('DataTable column pinning', () => {
  it('pins columns to both edges with sticky offsets and an edge rule', async () => {
    const { container } = render(<ResizablePinnedDataTable />);
    const headers = screen.getAllByRole('columnheader');
    // Selection, pinned name, the rest, pinned cost, actions.
    expect(headers[1]).toHaveTextContent('Deployment');
    expect(headers[headers.length - 2]).toHaveTextContent('Cost');
    const name = head(/Deployment/);
    expect(name).toHaveClass('sticky', 'border-e');
    expect(name.style.width).toBe('220px');
    const cost = head(/Cost/);
    expect(cost).toHaveClass('sticky', 'border-s');
    // The selection and actions columns stick with them.
    expect(headers[0]).toHaveClass('sticky');
    expect(headers[headers.length - 1]).toHaveClass('sticky');
    const firstRow = within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')[0]!;
    expect(within(firstRow).getAllByRole('cell')[1]).toHaveClass('sticky', 'bg-card');
    await expectNoAxeViolations(container);
  });

  it('pins and unpins from the column menu', async () => {
    // The submenu opens from the keyboard (ArrowRight on its trigger).
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onPinnedColumnsChange = vi.fn();
    render(<DataTable onPinnedColumnsChange={onPinnedColumnsChange} />);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const sub = await screen.findByRole('menuitem', { name: /^Region/ });
    act(() => sub.focus());
    await user.keyboard('{ArrowRight}');
    await user.click(await screen.findByRole('menuitemradio', { name: 'Pin left' }));
    expect(onPinnedColumnsChange).toHaveBeenLastCalledWith({ left: ['region'], right: [] });
    expect(screen.getAllByRole('columnheader')[1]).toHaveTextContent('Region');
    expect(head(/Region/)).toHaveClass('sticky');
  });

  it('computes layout helpers', () => {
    expect(setColumnPin({ left: ['a'] }, 'a', 'right')).toEqual({ left: [], right: ['a'] });
    const cols = [{ id: 'a', header: 'A' }, { id: 'b', header: 'B', width: 100 }, { id: 'c', header: 'C' }];
    expect(orderColumns(cols, { left: ['c'], right: ['a'] }).map((c) => c.id)).toEqual(['c', 'b', 'a']);
    const auto = tableLayout({ columns: cols, widths: {}, pinned: {}, sized: false, lead: true, trail: false });
    expect(auto.tableClassName).toBeUndefined();
    const l = tableLayout({ columns: cols, widths: { a: 90 }, pinned: { left: ['b', 'c'] }, sized: false, lead: true, trail: true });
    expect(l.columns.get('b')?.style).toMatchObject({ width: 100, insetInlineStart: 40 });
    expect(l.columns.get('c')?.style).toMatchObject({ insetInlineStart: 140 });
    expect(l.columns.get('c')?.className).toContain('border-e');
    expect(l.tableStyle).toEqual({ width: 90 + 100 + 160 + 40 + 48, minWidth: '100%' });
  });
});

describe('DataTable virtualization', () => {
  it('renders a window of rows with aria-rowcount and aria-rowindex', async () => {
    const { container } = render(<VirtualizedDataTable />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-virtualized', 'true');
    expect(table).toHaveAttribute('aria-rowcount', '5001');
    const rendered = container.querySelectorAll('tbody:not([data-virtual-spacer]) tr');
    expect(rendered.length).toBeGreaterThan(5);
    expect(rendered.length).toBeLessThan(60);
    expect(rendered[0]).toHaveAttribute('aria-rowindex', '2');
    expect(screen.getAllByRole('row')[0]).toHaveAttribute('aria-rowindex', '1');
    expect(container.querySelector('[data-virtual-spacer] td')).toHaveStyle({ height: `${(5000 - rendered.length) * 44}px` });
    await expectNoAxeViolations(container);
  });

  it('moves the window on scroll', async () => {
    const { container } = render(<DataTable rows={generateDeployments(1000)} paginated={false} />);
    const scroller = screen.getByRole('table').parentElement!;
    act(() => {
      scroller.scrollTop = 44 * 500;
      fireEvent.scroll(scroller);
    });
    await waitFor(() => expect(container.querySelector('tbody:not([data-virtual-spacer]) tr')?.getAttribute('aria-rowindex')).toBe(String(500 - 8 + 2)));
  });

  it('select-all covers every row, not only the rendered ones', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<DataTable rows={generateDeployments(400)} paginated={false} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toHaveLength(400);
  });

  it('virtualizes grouped rows, keeping a rowgroup per group', () => {
    render(<DataTable rows={generateDeployments(600)} groupBy="region" paginated={false} virtualize />);
    const groups = screen.getAllByRole('rowgroup').filter((g) => g.hasAttribute('data-group'));
    expect(groups.length).toBeGreaterThan(0);
    const header = screen.getAllByRole('rowheader')[0]!;
    expect(header).toHaveAttribute('scope', 'rowgroup');
    expect(header.closest('tr')).toHaveAttribute('aria-rowindex', '2');
  });

  it('stays off below the threshold and when disabled', () => {
    const { rerender } = render(<DataTable rows={generateDeployments(50)} paginated={false} />);
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-rowcount');
    rerender(<DataTable rows={generateDeployments(500)} paginated={false} virtualize={false} />);
    expect(within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')).toHaveLength(500);
  });

  it('windowFor clamps to the item count', () => {
    expect(windowFor(100, 0, 440, 44, 5)).toEqual({ start: 0, end: 16, rowHeight: 44 });
    expect(windowFor(100, 44 * 98, 440, 44, 5)).toEqual({ start: 93, end: 100, rowHeight: 44 });
  });
});
