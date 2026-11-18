import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';

const rows = Array.from({ length: 95 }, (_, i) => ({ id: String(i), status: i < 4 ? 'failed' : 'paused' }));
const columns: DataTableColumn<(typeof rows)[number]>[] = [
  { id: 'id', header: 'Id', accessor: (r) => r.id },
  {
    id: 'status',
    header: 'Status',
    accessor: (r) => r.status,
    sortable: true,
    filter: {
      type: 'enum',
      options: [
        { value: 'failed', label: 'Failed' },
        { value: 'paused', label: 'Paused' },
      ],
    },
  },
];
const renderedRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

it.each(['button', 'Enter'])('applies a draft enum via %s, resets page and returns focus', async (apply) => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DataTable rows={rows} columns={columns} defaultPage={3} onFilterModelChange={change} />);
  const trigger = screen.getByRole('button', { name: 'Filter Status' });
  expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger.closest('button')?.parentElement?.closest('button')).toBeNull();
  trigger.focus();
  await user.keyboard('{Enter}');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await user.click(await screen.findByRole('checkbox', { name: 'Failed' }));
  expect(change).not.toHaveBeenCalled();
  if (apply === 'button') await user.click(screen.getByRole('button', { name: 'Apply' }));
  else await user.keyboard('{Enter}');
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0]![0]).toMatchObject({
    type: 'group',
    combinator: 'and',
    children: [{ field: 'status', operator: 'in', value: ['failed'] }],
  });
  expect(renderedRows()).toHaveLength(4);
  expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('1–4 of 4');
  expect(screen.getByRole('button', { name: 'Page 1', current: 'page' })).toBeInTheDocument();
  expect(trigger).toHaveAccessibleName('Filter Status, filtered');
  expect(trigger.closest('th')).toHaveAttribute('data-filtered');
  expect(trigger.querySelector('svg')).toHaveClass('text-primary-text');
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.click(trigger);
  await user.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(change.mock.lastCall![0].children).toEqual([]);
  expect(renderedRows()).toHaveLength(10);
  await waitFor(() => expect(trigger).toHaveFocus());
});

it.each([
  { min: '100', max: '', operator: 'gte', value: 100, ids: ['b', 'c'] },
  { min: '', max: '100', operator: 'lte', value: 100, ids: ['a', 'b'] },
  { min: '100', max: '200', operator: 'between', value: [100, 200], ids: ['b', 'c'] },
])('stores numeric limits as $operator and includes the boundaries', async ({ min, max, operator, value, ids }) => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DataTable
      getRowLabel={(r) => r.id}
      rows={[
        { id: 'a', cost: 99 },
        { id: 'b', cost: 100 },
        { id: 'c', cost: 200 },
      ]}
      columns={[{ id: 'cost', header: 'Cost', accessor: (r) => r.cost, filter: { type: 'number' } }]}
      onFilterModelChange={change}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Filter Cost' }));
  if (min) await user.type(await screen.findByRole('textbox', { name: 'From' }), min);
  if (max) await user.type(await screen.findByRole('textbox', { name: 'To' }), max);
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  expect(change.mock.lastCall![0].children).toMatchObject([{ field: 'cost', operator, value }]);
  expect(screen.getAllByRole('checkbox', { name: /^Select [abc]$/ }).map((e) => e.getAttribute('aria-label'))).toEqual(
    ids.map((id) => `Select ${id}`),
  );
});

it('applies an inclusive date range using the kit calendar', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DataTable
      getRowLabel={(r) => r.id}
      rows={[
        { id: 'before', day: new Date(2026, 8, 30) },
        { id: 'start', day: new Date(2026, 9, 1, 23) },
        { id: 'middle', day: new Date(2026, 9, 10) },
        { id: 'end', day: new Date(2026, 9, 17, 23) },
        { id: 'after', day: new Date(2026, 9, 18) },
      ]}
      columns={[{ id: 'day', header: 'Created', accessor: (r) => r.day, filter: { type: 'date' } }]}
      defaultFilterModel={{
        type: 'group',
        id: 'dates',
        combinator: 'and',
        children: [
          { type: 'condition', id: 'date', field: 'day', operator: 'between', value: ['2026-10-02', '2026-10-16'] },
        ],
      }}
      onFilterModelChange={change}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Filter Created, filtered' }));
  await user.click(await screen.findByRole('combobox', { name: 'Created' }));
  await user.click(await screen.findByRole('button', { name: 'Thursday, October 1, 2026' }));
  await user.click(screen.getByRole('button', { name: 'Saturday, October 17, 2026' }));
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  expect(change.mock.lastCall![0].children).toMatchObject([
    { field: 'day', operator: 'between', value: ['2026-10-01', '2026-10-17'] },
  ]);
  expect(screen.getAllByRole('checkbox', { name: /^Select (start|middle|end)$/ })).toHaveLength(3);
  expect(screen.queryByRole('checkbox', { name: 'Select before' })).toBeNull();
  expect(screen.queryByRole('checkbox', { name: 'Select after' })).toBeNull();
});

it('maps boolean Yes, No and Any to isTrue, isFalse and no condition', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DataTable
      getRowLabel={(r) => r.id}
      rows={[
        { id: 'yes', enabled: true },
        { id: 'no', enabled: false },
      ]}
      columns={[{ id: 'enabled', header: 'Enabled', accessor: (r) => r.enabled, filter: { type: 'boolean' } }]}
      onFilterModelChange={change}
    />,
  );
  for (const [choice, operator, id] of [
    ['Yes', 'isTrue', 'yes'],
    ['No', 'isFalse', 'no'],
    ['Any', null, null],
  ]) {
    await user.click(screen.getByRole('button', { name: /^Filter Enabled/ }));
    await user.click(await screen.findByRole('radio', { name: choice! }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(change.mock.lastCall![0].children).toMatchObject(operator ? [{ field: 'enabled', operator }] : []);
    expect(renderedRows()).toHaveLength(id ? 1 : 2);
    if (id) expect(screen.getByRole('checkbox', { name: `Select ${id}` })).toBeInTheDocument();
  }
});

it('discards a draft with Escape and restores focus and the applied value', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DataTable rows={rows} columns={columns} onFilterModelChange={change} />);
  const trigger = screen.getByRole('button', { name: 'Filter Status' });
  await user.click(trigger);
  await user.click(await screen.findByRole('checkbox', { name: 'Paused' }));
  await user.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(change).not.toHaveBeenCalled();
  await user.click(trigger);
  expect(await screen.findByRole('checkbox', { name: 'Paused' })).not.toBeChecked();
});

it('applies the selected boolean draft with Enter and returns focus', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DataTable
      rows={[
        { id: 'yes', enabled: true },
        { id: 'no', enabled: false },
      ]}
      getRowLabel={(row) => row.id}
      columns={[{ id: 'enabled', header: 'Enabled', accessor: (row) => row.enabled, filter: { type: 'boolean' } }]}
      onFilterModelChange={change}
    />,
  );
  const trigger = screen.getByRole('button', { name: 'Filter Enabled' });
  await user.click(trigger);
  await user.click(await screen.findByRole('radio', { name: 'Yes' }));
  await user.keyboard('{Enter}');
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.lastCall![0].children).toMatchObject([{ field: 'enabled', operator: 'isTrue' }]);
  expect(screen.queryByRole('checkbox', { name: 'Select no' })).toBeNull();
  await waitFor(() => expect(trigger).toHaveFocus());
});

it.each([false, true])('labels enum search for a large or searchable list, searchable=%s', async (searchable) => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={rows}
      columns={[
        {
          ...columns[1]!,
          filter: {
            type: 'enum',
            searchable,
            options: searchable
              ? [{ value: 'failed', label: 'Failed' }]
              : Array.from({ length: 9 }, (_, i) => ({ value: String(i), label: `Option ${i}` })),
          },
        },
      ]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Filter Status' }));
  await user.type(await screen.findByRole('textbox', { name: 'Search' }), searchable ? 'fail' : 'Option 8');
  expect(within(screen.getByRole('dialog')).getAllByRole('checkbox')).toHaveLength(1);
});

it('keeps nested groups unchanged when a controlled header replaces or clears all top-level conditions', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const nested = {
    type: 'group' as const,
    id: 'nested',
    combinator: 'or' as const,
    children: [
      { type: 'condition' as const, id: 'inner', field: 'id', operator: 'eq' as const, value: '0' },
      { type: 'condition' as const, id: 'other', field: 'id', operator: 'eq' as const, value: '4' },
    ],
  };
  const model = {
    type: 'group' as const,
    id: 'root',
    combinator: 'and' as const,
    children: [
      nested,
      { type: 'condition' as const, id: 'old1', field: 'status', operator: 'in' as const, value: ['failed', 'paused'] },
      { type: 'condition' as const, id: 'old2', field: 'status', operator: 'neq' as const, value: 'unknown' },
    ],
  };
  const props = { rows, columns, onFilterModelChange: change };
  const { rerender } = render(<DataTable {...props} filterModel={model} />);
  expect(renderedRows()).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: 'Filter Status, filtered' }));
  await user.click(await screen.findByRole('checkbox', { name: 'Paused' }));
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  const next = change.mock.lastCall![0];
  expect(next.children).toHaveLength(2);
  expect(next.children[0]).toBe(nested);
  expect(next.children[1]).toMatchObject({ field: 'status', operator: 'in', value: ['failed'] });
  expect(renderedRows()).toHaveLength(2);
  rerender(<DataTable {...props} filterModel={next} />);
  expect(renderedRows()).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Filter Status, filtered' }));
  const clear = await screen.findByRole('button', { name: 'Clear' });
  clear.focus();
  await user.keyboard('{Enter}');
  expect(change.mock.lastCall![0].children).toEqual([nested]);
});
