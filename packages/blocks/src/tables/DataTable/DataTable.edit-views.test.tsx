import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';
import EditableDataTable from './examples/editable';
import SavedViewsDataTable from './examples/saved-views';
import { DEPLOYMENT_ROWS, type DeploymentRow } from './fixtures';
import { newViewId, sameViewState, type DataTableView } from './views';

const first = DEPLOYMENT_ROWS[0]!;
const second = DEPLOYMENT_ROWS[1]!;
const editColumns: Array<DataTableColumn<DeploymentRow>> = [
  { id: 'name', header: 'Deployment', accessor: (r) => r.name, editable: true },
  { id: 'region', header: 'Region', accessor: (r) => r.region },
  { id: 'cost', header: 'Cost', accessor: (r) => r.cost, editable: (r) => r.status !== 'failed', editor: { type: 'number', min: 0, max: 1000 } },
];
const rows = DEPLOYMENT_ROWS.slice(0, 3);
const cell = (text: string) => screen.getByRole('button', { name: text });

describe('DataTable inline editing', () => {
  it('edits with Enter, commits with Enter and returns focus', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<DataTable rows={rows} columns={editColumns} paginated={false} onCellEdit={onCellEdit} />);
    const trigger = cell(first.name);
    expect(trigger).toHaveAccessibleDescription('Press Enter or F2 to edit.');
    trigger.focus();
    await user.keyboard('{Enter}');
    const input = screen.getByRole('textbox', { name: `Deployment for ${first.name}` });
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, 'renamed{Enter}');
    expect(onCellEdit).toHaveBeenCalledWith({ row: first, rowId: first.id, columnId: 'name', value: 'renamed', previous: first.name });
    await waitFor(() => expect(cell(first.name)).toHaveFocus());
  });

  it('starts with F2 and cancels with Escape', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<DataTable rows={rows} columns={editColumns} paginated={false} onCellEdit={onCellEdit} />);
    cell(first.name).focus();
    await user.keyboard('{F2}');
    await user.keyboard('xyz{Escape}');
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(cell(first.name)).toHaveFocus();
  });

  it('commits with Tab and moves to the next editable cell', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<DataTable rows={rows} columns={editColumns} paginated={false} onCellEdit={onCellEdit} />);
    cell(first.name).focus();
    await user.keyboard('{Enter}{End}-v2{Tab}');
    expect(onCellEdit).toHaveBeenLastCalledWith(expect.objectContaining({ columnId: 'name', value: `${first.name}-v2` }));
    await waitFor(() => expect(cell(String(first.cost))).toHaveFocus());
  });

  it('shows a rejection inline and keeps editing', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn(async () => 'That name is taken.');
    const { container } = render(<DataTable rows={rows} columns={editColumns} paginated={false} onCellEdit={onCellEdit} />);
    cell(first.name).focus();
    await user.keyboard(`{Enter}{Control>}a{/Control}${second.name}{Enter}`);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('That name is taken.');
    const input = screen.getByRole('textbox', { name: `Deployment for ${first.name}` });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('That name is taken.');
    expect(input).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it('reports thrown errors and validates numbers before calling onCellEdit', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn(() => {
      throw new Error('Server unavailable');
    });
    render(<DataTable rows={rows} columns={editColumns} paginated={false} onCellEdit={onCellEdit} />);
    cell(String(first.cost)).focus();
    await user.keyboard('{Enter}');
    const input = screen.getByRole('spinbutton', { name: `Cost for ${first.name}` });
    await user.clear(input);
    await user.type(input, '5000{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter 1000 or less.');
    expect(onCellEdit).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, '12{Enter}');
    expect(onCellEdit).toHaveBeenLastCalledWith(expect.objectContaining({ value: 12 }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
  });

  it('edits with the select editor of the example and shows server rejections', async () => {
    const user = userEvent.setup();
    render(<EditableDataTable />);
    const statusTrigger = within(screen.getAllByRole('row')[1]!).getAllByRole('button')[1]!;
    statusTrigger.focus();
    await user.keyboard('{Enter}');
    const select = screen.getByRole('combobox', { name: `Status for ${first.name}` });
    await user.selectOptions(select, 'paused');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(within(screen.getAllByRole('row')[1]!).getByText('Paused')).toBeInTheDocument());
    // Example: budgets above $1,000 are rejected by the simulated server.
    const budget = within(screen.getAllByRole('row')[1]!).getAllByRole('button')[2]!;
    budget.focus();
    await user.keyboard('{Enter}{Control>}a{/Control}1500{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Budgets above $1,000 need approval.');
  });

  it('per-row editable functions leave other cells read-only', () => {
    const failing = { ...first, id: 'x', status: 'failed' as const, cost: 77 };
    render(<DataTable rows={[failing]} columns={editColumns} paginated={false} onCellEdit={() => undefined} />);
    expect(screen.queryByRole('button', { name: '77' })).toBeNull();
    expect(screen.getByText('77').closest('td')).toBeInTheDocument();
  });
});

describe('DataTable saved views', () => {
  const views: DataTableView[] = [
    { id: 'expensive', name: 'Most expensive', state: { sort: { columnId: 'cost', direction: 'descending' }, hiddenColumns: ['region', 'updated'] } },
    { id: 'grouped', name: 'By region', state: { groupBy: 'region', pinnedColumns: { left: ['name'] }, filters: { q: 'api' } } },
  ];

  it('switches views from the menu', async () => {
    const user = userEvent.setup();
    const onActiveViewChange = vi.fn();
    const onFiltersChange = vi.fn();
    const onGroupByChange = vi.fn();
    const { container } = render(
      <DataTable defaultViews={views} onActiveViewChange={onActiveViewChange} onFiltersChange={onFiltersChange} onGroupByChange={onGroupByChange} paginated={false} />,
    );
    await user.click(screen.getByRole('button', { name: 'Default view' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Most expensive' }));
    expect(onActiveViewChange).toHaveBeenLastCalledWith('expensive');
    expect(screen.getByRole('columnheader', { name: /Cost/ })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.queryByRole('columnheader', { name: /Region/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Most expensive' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'By region' }));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ q: 'api' });
    expect(onGroupByChange).toHaveBeenLastCalledWith('region');
    expect(screen.getAllByRole('rowheader')[0]).toHaveAttribute('scope', 'rowgroup');
    expect(screen.getByRole('columnheader', { name: /Region/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Deployment/ })).toHaveClass('sticky');
    await expectNoAxeViolations(container);
  });

  it('marks changes, resets and saves them to the active view', async () => {
    const user = userEvent.setup();
    const onViewsChange = vi.fn();
    render(<DataTable defaultViews={views} defaultActiveViewId="expensive" onViewsChange={onViewsChange} />);
    // Seeded from the active view.
    expect(screen.getByRole('columnheader', { name: /Cost/ })).toHaveAttribute('aria-sort', 'descending');
    await user.click(screen.getByRole('button', { name: /Status/ }));
    const trigger = screen.getByRole('button', { name: 'Most expensive (modified)' });
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: 'Reset changes' }));
    expect(screen.getByRole('columnheader', { name: /Cost/ })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('button', { name: 'Most expensive' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Status/ }));
    await user.click(screen.getByRole('button', { name: 'Most expensive (modified)' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Save changes' }));
    expect(onViewsChange.mock.lastCall?.[0][0].state.sort).toEqual({ columnId: 'status', direction: 'ascending' });
    expect(screen.getByRole('button', { name: 'Most expensive' })).toBeInTheDocument();
  });

  it('saves as a new view, renames and deletes it', async () => {
    const user = userEvent.setup();
    const onViewsChange = vi.fn();
    render(<DataTable defaultViews={views} onViewsChange={onViewsChange} resizable />);
    screen.getByRole('separator', { name: 'Resize Region column' }).focus();
    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByRole('button', { name: 'Default view (modified)' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Save as new view…' }));
    const dialog = await screen.findByRole('dialog', { name: 'Save view' });
    await user.type(within(dialog).getByRole('textbox', { name: 'View name' }), 'Wide region{Enter}');
    const saved = onViewsChange.mock.lastCall?.[0] as DataTableView[];
    expect(saved).toHaveLength(3);
    expect(saved[2]).toMatchObject({ id: 'wide-region', name: 'Wide region', state: { columnWidths: { region: 170 } } });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Wide region' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename view…' }));
    const rename = await screen.findByRole('dialog', { name: 'Rename view' });
    const field = within(rename).getByRole('textbox', { name: 'View name' });
    expect(field).toHaveValue('Wide region');
    await user.clear(field);
    await user.type(field, 'Regions{Enter}');
    expect((onViewsChange.mock.lastCall?.[0] as DataTableView[])[2]?.name).toBe('Regions');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Regions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete view' }));
    expect(onViewsChange.mock.lastCall?.[0]).toHaveLength(2);
    expect(screen.getByRole('button', { name: /^Default view/ })).toBeInTheDocument();
  });

  it('the example restores filters with a view', async () => {
    const user = userEvent.setup();
    render(<SavedViewsDataTable />);
    await user.click(screen.getByRole('button', { name: 'Default view' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Needs attention' }));
    const failedCount = DEPLOYMENT_ROWS.filter((r) => r.status === 'failed').length;
    await waitFor(() => expect(within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')).toHaveLength(failedCount));
    await user.click(screen.getByRole('button', { name: 'Needs attention' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Default view' }));
    await waitFor(() => expect(within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')).toHaveLength(10));
  });

  it('view helpers', () => {
    expect(sameViewState({ hiddenColumns: ['b', 'a'] }, { hiddenColumns: ['a', 'b'], sort: null })).toBe(true);
    expect(sameViewState({ columnWidths: { a: 1 } }, {})).toBe(false);
    expect(newViewId('My view!', [{ id: 'my-view', name: 'x', state: {} }])).toBe('my-view-2');
  });
});
