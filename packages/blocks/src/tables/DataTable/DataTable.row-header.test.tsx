import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable } from './DataTable';
import { rowHeaderColumnId, type DataTableColumn } from './data-table-utils';
import RowHeaderDataTable from './examples/row-header';
import { DEPLOYMENT_COLUMNS, DEPLOYMENT_ROWS, generateDeployments, type DeploymentRow } from './fixtures';

const body = () => screen.getAllByRole('rowgroup').at(-1)!;
const dataRows = () => within(body()).getAllByRole('row');
const column = (id: string): DataTableColumn<DeploymentRow> => DEPLOYMENT_COLUMNS.find((c) => c.id === id)!;

describe('rowHeaderColumnId', () => {
  const cols = (...rowHeaders: Array<boolean | undefined>): DataTableColumn<object>[] =>
    rowHeaders.map((rowHeader, i) => ({ id: `c${i}`, header: `C${i}`, rowHeader }));

  it('defaults to the first column', () => {
    expect(rowHeaderColumnId(cols(undefined, undefined))).toBe('c0');
  });

  it('is none when the first column opts out and no other is marked', () => {
    expect(rowHeaderColumnId(cols(false, undefined))).toBeUndefined();
  });

  it('prefers the first column marked true, even after an opt-out', () => {
    expect(rowHeaderColumnId(cols(undefined, true, true))).toBe('c1');
    expect(rowHeaderColumnId(cols(false, true))).toBe('c1');
  });

  it('is none without columns', () => {
    expect(rowHeaderColumnId([])).toBeUndefined();
  });
});

describe('DataTable row headers', () => {
  it('renders the first column of every data row as one row header', () => {
    render(<DataTable />);
    const rows = dataRows();
    expect(rows).toHaveLength(10);
    const first = rows[0]!;
    const header = within(first).getByRole('rowheader');
    expect(header).toHaveTextContent('orders-api');
    expect(header.tagName).toBe('TH');
    expect(header).toHaveAttribute('scope', 'row');
    expect(within(first).getAllByRole('rowheader')).toHaveLength(1);
    expect(within(first).getByRole('cell', { name: 'eu-west-1' })).toBeInTheDocument();
    expect(within(first).getByRole('cell', { name: /running/i })).toBeInTheDocument();
    for (const row of rows) expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
  });

  it('keeps the density, alignment and normal weight of the cell it replaces', () => {
    render(<DataTable columns={[{ ...column('name'), className: undefined }, column('cost')]} />);
    const header = within(dataRows()[0]!).getByRole('rowheader');
    expect(header).toHaveClass('px-4', 'py-3', 'border-b', 'text-start', 'font-normal', 'whitespace-nowrap');
  });

  it('keeps the column variant, className and width style on the row header', () => {
    render(
      <DataTable
        resizable
        columns={[{ ...column('name'), variant: 'mono', className: 'text-warning', width: 200 }, column('region')]}
      />,
    );
    const header = within(dataRows()[0]!).getByRole('rowheader');
    expect(header).toHaveClass('font-mono', 'text-warning');
    expect(header.style.width).toBe('200px');
  });

  it('keeps the last row free of a bottom rule through the body selector', () => {
    const { container } = render(<DataTable />);
    expect(container.querySelector('tbody')?.className).toContain('[&>tr:last-child>th[scope=row]]:border-b-0');
  });

  it('promotes the column marked rowHeader and names the controls after it', () => {
    render(
      <DataTable
        selectable
        columns={[column('status'), { ...column('name'), rowHeader: true }, column('region')]}
        rowActions={() => [{ id: 'open', label: 'Open' }]}
      />,
    );
    const first = dataRows()[0]!;
    expect(within(first).getByRole('rowheader')).toHaveTextContent('orders-api');
    expect(
      within(first)
        .getAllByRole('cell')
        .some((c) => c.tagName === 'TH'),
    ).toBe(false);
    expect(within(first).getByRole('cell', { name: /running/i }).tagName).toBe('TD');
    expect(within(first).getByRole('checkbox', { name: 'Select orders-api' })).toBeInTheDocument();
    expect(within(first).getByRole('button', { name: 'Actions for orders-api' })).toBeInTheDocument();
  });

  it('renders only td cells when the first column opts out and none is marked', () => {
    render(<DataTable selectable columns={[{ ...column('name'), rowHeader: false }, column('region')]} />);
    expect(screen.queryAllByRole('rowheader')).toHaveLength(0);
    expect(body().querySelectorAll('th')).toHaveLength(0);
    // The label still falls back to the first column.
    expect(screen.getByRole('checkbox', { name: 'Select orders-api' })).toBeInTheDocument();
  });

  it('leaves no row header while the row-header column is hidden and restores it when shown', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const columns = [{ ...column('name'), hideable: true }, column('region'), column('status')];
    render(<DataTable columns={columns} />);
    expect(screen.getAllByRole('rowheader')).toHaveLength(10);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: /Deployment/ }));
    await user.keyboard('{Escape}');
    expect(screen.queryAllByRole('rowheader')).toHaveLength(0);
    expect(body().querySelectorAll('th')).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: /Deployment/ }));
    await user.keyboard('{Escape}');
    expect(screen.getAllByRole('rowheader')).toHaveLength(10);
  });

  it('keeps group headers as rowgroup and gives each data row one row header', () => {
    render(<DataTable groupBy="region" paginated={false} rows={DEPLOYMENT_ROWS.slice(0, 8)} />);
    const rows = Array.from(document.querySelectorAll('tbody tr:not([data-group-header])'));
    expect(rows).toHaveLength(8);
    for (const row of rows) expect(row.querySelectorAll('th[scope="row"]')).toHaveLength(1);
    expect(document.querySelectorAll('tr[data-group-header] th[scope="rowgroup"]').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('tr[data-group-header] th[scope="row"]')).toHaveLength(0);
  });

  it('keeps the pinned layout classes on a pinned row-header column', () => {
    render(
      <DataTable
        resizable
        pinnedColumns={{ left: ['name'], right: [] }}
        columns={[column('name'), column('region')]}
      />,
    );
    const header = within(dataRows()[0]!).getByRole('rowheader');
    expect(header).toHaveClass('sticky', 'bg-card', 'z-raised');
  });

  it('renders one row header per windowed row of a virtualized table', () => {
    const { container } = render(<DataTable rows={generateDeployments(500)} paginated={false} />);
    const rendered = container.querySelectorAll('tbody:not([data-virtual-spacer]) tr');
    expect(rendered.length).toBeGreaterThan(5);
    expect(rendered.length).toBeLessThan(60);
    expect(screen.getAllByRole('rowheader')).toHaveLength(rendered.length);
    expect(rendered[0]).toHaveAttribute('aria-rowindex', '2');
    expect(rendered[0]!.querySelector('th[scope="row"]')).toHaveTextContent('orders-api');
  });

  it('edits the row-header cell with Enter inside the th', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<DataTable columns={[{ ...column('name'), editable: true }, column('region')]} onCellEdit={onCellEdit} />);
    const header = within(dataRows()[0]!).getByRole('rowheader');
    await user.click(within(header).getByRole('button', { name: /orders-api/ }));
    const input = within(header).getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'orders-v2');
    await user.keyboard('{Enter}');
    expect(onCellEdit).toHaveBeenCalledTimes(1);
  });

  it('keeps the Tab order inside a row: selection, edit trigger, row actions', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        selectable
        rows={DEPLOYMENT_ROWS.slice(0, 2)}
        columns={[{ ...column('name'), editable: true }, column('region')]}
        onCellEdit={vi.fn()}
        rowActions={() => [{ id: 'open', label: 'Open' }]}
      />,
    );
    const first = dataRows()[0]!;
    const checkbox = within(first).getByRole('checkbox', { name: 'Select orders-api' });
    checkbox.focus();
    await user.tab();
    expect(within(within(first).getByRole('rowheader')).getByRole('button')).toHaveFocus();
    await user.tab();
    expect(within(first).getByRole('button', { name: 'Actions for orders-api' })).toHaveFocus();
  });

  it('is axe clean', async () => {
    const { container } = render(<DataTable selectable />);
    await expectNoAxeViolations(container);
  });

  it('shows the marked name column as the row header in the status-first example', async () => {
    const { container } = render(<RowHeaderDataTable />);
    const first = within(screen.getAllByRole('rowgroup').at(-1)!).getAllByRole('row')[0]!;
    expect(within(first).getByRole('rowheader')).toHaveTextContent('orders-api');
    expect(within(first).getByRole('checkbox', { name: 'Select orders-api' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
