import { I18nProvider, LiveAnnouncer } from '@gntik-ai/ui';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DataTable } from './DataTable';
import { reorderRows } from './data-table-utils';

const rows = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
const columns = [{ id: 'id', header: 'Name', accessor: (row: { id: string }) => row.id }];
const handle = (id: string) => screen.getByRole('button', { name: `Reorder ${id}` });
const order = () => screen.getAllByRole('rowheader').map((cell) => cell.textContent);

it('previews a keyboard move, commits once with neighbours, and retains handle focus', async () => {
  const user = userEvent.setup();
  const moved = vi.fn();
  function Example() {
    const [items, setItems] = useState(rows);
    return (
      <DataTable
        rows={items}
        columns={columns}
        onRowReorder={(move) => {
          moved(move);
          setItems((current) => reorderRows(current, move));
        }}
      />
    );
  }
  render(<Example />);
  const row = handle('C').closest('tr')!;
  expect(within(row).getAllByRole('cell')[0]).toContainElement(within(row).getByRole('checkbox'));
  expect(within(row).getAllByRole('cell')[1]).toContainElement(handle('C'));
  expect(screen.getByRole('columnheader', { name: 'Reorder' }).firstChild).toHaveClass('sr-only');
  handle('C').focus();
  await user.keyboard(' {ArrowUp}');
  expect(order()).toEqual(['A', 'C', 'B']);
  expect(moved).not.toHaveBeenCalled();
  expect(handle('C')).toHaveFocus();
  await user.keyboard(' ');
  expect(moved).toHaveBeenCalledExactlyOnceWith({ rowId: 'C', fromIndex: 2, toIndex: 1, previousId: 'A', nextId: 'B' });
  expect(order()).toEqual(['A', 'C', 'B']);
  expect(handle('C')).toHaveFocus();
});

it.each([
  ['A', 'ArrowDown', { rowId: 'A', fromIndex: 0, toIndex: 1, previousId: 'B', nextId: 'C' }],
  ['C', 'ArrowUp', { rowId: 'C', fromIndex: 2, toIndex: 1, previousId: 'A', nextId: 'B' }],
] as const)('commits Alt+%s %s immediately', async (id, key, expected) => {
  const user = userEvent.setup();
  const moved = vi.fn();
  function Example() {
    const [items, setItems] = useState(rows);
    return (
      <DataTable
        rows={items}
        columns={columns}
        onRowReorder={(move) => {
          moved(move);
          setItems((current) => reorderRows(current, move));
        }}
      />
    );
  }
  render(<Example />);
  handle(id).focus();
  await user.keyboard(`{Alt>}{${key}}{/Alt}`);
  expect(moved).toHaveBeenCalledExactlyOnceWith(expected);
  expect(handle(id)).toHaveFocus();
});

it.each(['Escape', 'Tab'])('cancels on %s and restores the original order', async (key) => {
  const user = userEvent.setup();
  const moved = vi.fn();
  render(<DataTable rows={rows} columns={columns} onRowReorder={moved} />);
  handle('C').focus();
  await user.keyboard(' {Home}');
  expect(order()).toEqual(['C', 'A', 'B']);
  await user.keyboard(`{${key}}`);
  expect(order()).toEqual(['A', 'B', 'C']);
  expect(moved).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Move cancelled. C returned to position 3.');
});

it('jumps to the page ends and commits with Enter using indexes in the supplied rows', async () => {
  const user = userEvent.setup();
  const moved = vi.fn();
  render(
    <DataTable
      rows={[{ id: 'before' }, ...rows, { id: 'after' }]}
      columns={columns}
      page={2}
      pageSize={2}
      onRowReorder={moved}
    />,
  );
  handle('B').focus();
  await user.keyboard(' {End}{Enter}');
  expect(moved).toHaveBeenCalledExactlyOnceWith({
    rowId: 'B',
    fromIndex: 2,
    toIndex: 3,
    previousId: 'C',
    nextId: 'after',
  });
  expect(handle('B')).toHaveFocus();
});

it('leaves the original table DOM unchanged when reordering is absent', () => {
  render(<DataTable rows={rows} columns={columns} />);
  expect(screen.queryByRole('button', { name: /Reorder/ })).not.toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  expect(document.querySelector('[data-live-announcer]')).toBeNull();
});

it('preserves uncontrolled selection and sorting when reordering is toggled', async () => {
  const user = userEvent.setup();
  const props = { rows, columns: [{ ...columns[0]!, sortable: true }] };
  const { rerender } = render(<DataTable {...props} />);
  await user.click(screen.getByRole('checkbox', { name: 'Select A' }));
  await user.click(screen.getByRole('button', { name: 'Name' }));
  for (const onRowReorder of [vi.fn(), undefined]) {
    rerender(<DataTable {...props} onRowReorder={onRowReorder} />);
    expect(screen.getByRole('checkbox', { name: 'Select A' })).toBeChecked();
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
  }
});

it('uses the selected tint for the pinned grip cell', async () => {
  const user = userEvent.setup();
  render(<DataTable rows={rows} columns={columns} pinnedColumns={{ left: ['id'] }} onRowReorder={vi.fn()} />);
  const cell = handle('A').closest('td')!;
  await user.click(screen.getByRole('checkbox', { name: 'Select A' }));
  expect(cell).toHaveClass('before:bg-primary/8');
  expect(cell).not.toHaveClass('[tr:hover>&]:before:bg-accent/30');
  await user.click(screen.getByRole('checkbox', { name: 'Select A' }));
  expect(cell).toHaveClass('[tr:hover>&]:before:bg-accent/30');
});

it('lets keyboard users focus unavailable handles and hear the reason without starting a move', async () => {
  const user = userEvent.setup();
  const moved = vi.fn();
  render(
    <DataTable rows={rows} columns={columns} onRowReorder={moved} sort={{ columnId: 'id', direction: 'ascending' }} />,
  );
  screen.getByRole('checkbox', { name: 'Select A' }).focus();
  await user.tab();
  expect(handle('A')).toHaveFocus();
  expect(handle('A')).toHaveAttribute('aria-disabled', 'true');
  expect(handle('A')).toHaveAccessibleDescription('Clear sorting, grouping and filters to reorder rows.');
  await user.keyboard(' {ArrowDown} {Alt>}{ArrowDown}{/Alt}');
  expect(order()).toEqual(['A', 'B', 'C']);
  expect(moved).not.toHaveBeenCalled();
});

it('applies moves without mutating the source and supports upward and downward moves', () => {
  expect(reorderRows(rows, { rowId: 'A', fromIndex: 0, toIndex: 2, previousId: 'C', nextId: null })).toEqual([
    rows[1],
    rows[2],
    rows[0],
  ]);
  expect(reorderRows(rows, { rowId: 'C', fromIndex: 2, toIndex: 0, previousId: null, nextId: 'A' })).toEqual([
    rows[2],
    rows[0],
    rows[1],
  ]);
  expect(rows).toEqual([{ id: 'A' }, { id: 'B' }, { id: 'C' }]);
});

it('previews pointer moves from the grip icon only after the activation distance and drops once', () => {
  const moved = vi.fn();
  const layout = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const row = this.closest('tr[data-row-id]');
    const index = row?.parentElement ? Array.from(row.parentElement.children).indexOf(row) : 0;
    return {
      x: 0,
      y: index * 50,
      left: 0,
      top: index * 50,
      width: 400,
      height: row ? 50 : 500,
      right: 400,
      bottom: row ? (index + 1) * 50 : 500,
      toJSON: () => ({}),
    };
  });
  try {
    render(<DataTable rows={rows} columns={columns} onRowReorder={moved} />);
    const grip = handle('A');
    const press = () =>
      fireEvent.pointerDown(grip.querySelector('svg')!, {
        button: 0,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'mouse',
        clientX: 20,
        clientY: 20,
      });
    press();
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 22, clientY: 21 });
    fireEvent.pointerUp(window, { pointerId: 1 });
    expect(grip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(moved).not.toHaveBeenCalled();
    press();
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 20, clientY: 160 });
    expect(order()).toEqual(['B', 'C', 'A']);
    expect(grip.closest('tr')).toHaveAttribute('data-dragging');
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 20, clientY: 160 });
    expect(moved).toHaveBeenCalledExactlyOnceWith({
      rowId: 'A',
      fromIndex: 0,
      toIndex: 2,
      previousId: 'C',
      nextId: null,
    });
  } finally {
    layout.mockRestore();
  }
});

it('cancels and announces when the lifted row disappears from the supplied rows', async () => {
  const user = userEvent.setup();
  const moved = vi.fn();
  const { rerender } = render(<DataTable rows={rows} columns={columns} onRowReorder={moved} />);
  handle('C').focus();
  await user.keyboard(' {ArrowUp}');
  rerender(<DataTable rows={rows.slice(0, 2)} columns={columns} onRowReorder={moved} />);
  expect(order()).toEqual(['A', 'B']);
  expect(moved).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Move cancelled. C returned to position 3.');
});

it('cancels a pending pointer press when sorting disables reordering', () => {
  const moved = vi.fn();
  const { rerender } = render(<DataTable rows={rows} columns={columns} onRowReorder={moved} />);
  fireEvent.pointerDown(handle('A'), {
    button: 0,
    isPrimary: true,
    pointerId: 9,
    pointerType: 'mouse',
    clientX: 20,
    clientY: 20,
  });
  rerender(
    <DataTable rows={rows} columns={columns} onRowReorder={moved} sort={{ columnId: 'id', direction: 'descending' }} />,
  );
  expect(handle('A')).toHaveAttribute('aria-disabled', 'true');
  fireEvent.pointerMove(window, { pointerId: 9, clientX: 20, clientY: 160 });
  expect(handle('A').closest('tr')).not.toHaveAttribute('data-dragging');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  fireEvent.pointerUp(window, { pointerId: 9 });
  expect(moved).not.toHaveBeenCalled();
});

it.each([
  [
    'en',
    'Reorder orders-api',
    'Picked up orders-api. Position 3 of 24.',
    'orders-api moved to position 2 of 24.',
    'orders-api dropped at position 2 of 24.',
  ],
  [
    'es',
    'Reordenar orders-api',
    'Has recogido orders-api. Posición 3 de 24.',
    'orders-api se ha movido a la posición 2 de 24.',
    'orders-api se ha soltado en la posición 2 de 24.',
  ],
])(
  'announces the row label, absolute position and total in %s through the nearest announcer',
  async (locale, name, picked, moving, dropped) => {
    const user = userEvent.setup();
    const items = Array.from({ length: 24 }, (_, i) => ({ id: i === 2 ? 'orders-api' : `rule-${i}` }));
    render(
      <I18nProvider locale={locale!}>
        <LiveAnnouncer>
          <DataTable rows={items} columns={columns} onRowReorder={vi.fn()} />
        </LiveAnnouncer>
      </I18nProvider>,
    );
    expect(document.querySelectorAll('[data-live-announcer="polite"]')).toHaveLength(1);
    const grip = screen.getByRole('button', { name: name! });
    expect(grip).toHaveAccessibleDescription(/Space|Espacio/);
    grip.focus();
    await user.keyboard(' ');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(picked!);
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('status')).toHaveTextContent(moving!);
    await user.keyboard(' ');
    expect(screen.getByRole('status')).toHaveTextContent(dropped!);
  },
);

it.each([
  { sort: { columnId: 'id', direction: 'ascending' as const } },
  { groupBy: 'id' as const },
  { quickFilter: 'A' },
  {
    filterModel: {
      type: 'group' as const,
      id: 'filters',
      combinator: 'and' as const,
      children: [{ type: 'condition' as const, id: 'a', field: 'id', operator: 'eq' as const, value: 'A' }],
    },
  },
  { filtered: true },
  { filters: { status: 'active' } },
])('disables handles in a transformed view: %j', (props) => {
  render(<DataTable rows={rows} columns={columns} onRowReorder={vi.fn()} {...props} />);
  const handles = screen.getAllByRole('button', { name: /^Reorder / });
  for (const grip of handles) {
    expect(grip).toHaveAttribute('aria-disabled', 'true');
    expect(grip).toHaveAccessibleDescription('Clear sorting, grouping and filters to reorder rows.');
  }
});

it('locks only the specified row and allows another row to move past it', async () => {
  const user = userEvent.setup();
  const moved = vi.fn();
  render(<DataTable rows={rows} columns={columns} onRowReorder={moved} isRowReorderable={(row) => row.id !== 'B'} />);
  expect(handle('B')).toBeDisabled();
  fireEvent.pointerDown(handle('B'), {
    button: 0,
    isPrimary: true,
    pointerId: 8,
    pointerType: 'mouse',
    clientX: 0,
    clientY: 0,
  });
  fireEvent.pointerMove(window, { pointerId: 8, clientX: 10, clientY: 100 });
  fireEvent.pointerUp(window, { pointerId: 8 });
  expect(moved).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(handle('A')).toBeEnabled();
  handle('C').focus();
  await user.keyboard(' {ArrowUp} ');
  expect(moved).toHaveBeenCalledExactlyOnceWith({ rowId: 'C', fromIndex: 2, toIndex: 1, previousId: 'A', nextId: 'B' });
});

it('keeps links, selection and actions independent from dragging', async () => {
  const user = userEvent.setup();
  const moved = vi.fn();
  const activated = vi.fn((_, event) => event.preventDefault());
  const action = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={columns}
      getRowHref={(row) => `#${row.id}`}
      onRowClick={activated}
      rowActions={() => [{ label: 'Inspect', onSelect: action }]}
      onRowReorder={moved}
    />,
  );
  const row = handle('A').closest('tr')!;
  for (const target of [
    within(row).getByRole('link'),
    within(row).getByRole('checkbox'),
    within(row).getByRole('button', { name: 'Actions for A' }),
  ]) {
    fireEvent.pointerDown(target, {
      button: 0,
      isPrimary: true,
      pointerId: 3,
      pointerType: 'mouse',
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerMove(window, { pointerId: 3, clientX: 20, clientY: 160 });
    fireEvent.pointerUp(window, { pointerId: 3 });
    expect(handle('A')).toHaveAttribute('aria-pressed', 'false');
  }
  await user.click(within(row).getByRole('checkbox'));
  expect(within(row).getByRole('checkbox')).toBeChecked();
  await user.click(within(row).getByRole('link'));
  expect(activated).toHaveBeenCalledTimes(1);
  await user.click(within(row).getByRole('button', { name: 'Actions for A' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Inspect' }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(moved).not.toHaveBeenCalled();
});

it('renders all 300 rows when virtualization is requested and warns only once', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const items = Array.from({ length: 300 }, (_, i) => ({ id: `row-${i}` }));
    const { rerender } = render(
      <DataTable rows={items} columns={columns} onRowReorder={vi.fn()} paginated={false} virtualize />,
    );
    expect(screen.getAllByRole('rowheader')).toHaveLength(300);
    expect(screen.getByRole('table')).not.toHaveAttribute('data-virtualized');
    rerender(<DataTable rows={items} columns={columns} onRowReorder={vi.fn()} paginated={false} virtualize />);
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('onRowReorder'));
    rerender(<DataTable rows={items} columns={columns} onRowReorder={vi.fn()} paginated={false} virtualize="auto" />);
    expect(screen.getAllByRole('rowheader')).toHaveLength(300);
    expect(screen.getByRole('table')).not.toHaveAttribute('data-virtualized');
  } finally {
    warning.mockRestore();
  }
});

it('warns once when reordering and detail rows both disable forced virtualization', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    render(<DataTable rows={rows} columns={columns} onRowReorder={vi.fn()} renderDetail={() => 'Detail'} virtualize />);
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('onRowReorder'));
  } finally {
    warning.mockRestore();
  }
});
