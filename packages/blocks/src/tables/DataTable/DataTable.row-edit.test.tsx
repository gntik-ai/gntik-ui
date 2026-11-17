import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';

const rows = [
  { id: 'a', name: 'api-gateway', quota: 100 },
  { id: 'b', name: 'billing', quota: 200 },
];
type Row = (typeof rows)[number];
const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', sortable: true, accessor: (row) => row.name, editable: true },
  { id: 'quota', header: 'Quota', accessor: (row) => row.quota, editable: true, editor: { type: 'number' } },
];

it.each(['controlled', 'default'] as const)('leaves focus alone when %s editing rows first render', async (mode) => {
  const user = userEvent.setup();
  const view = render(<button>Outside table</button>);
  const outside = screen.getByRole('button', { name: 'Outside table' });
  await user.click(outside);
  view.rerender(
    <>
      <button>Outside table</button>
      <DataTable
        rows={rows}
        columns={columns}
        editMode="row"
        {...(mode === 'controlled' ? { editingRowIds: ['a', 'b'] } : { defaultEditingRowIds: ['a', 'b'] })}
      />
    </>,
  );
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
  expect(outside).toHaveFocus();
});

it('keeps focus on pagination when editing rows mount on the next page and back', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={[...rows, { id: 'c', name: 'worker', quota: 300 }]}
      columns={columns}
      editMode="row"
      editingRowIds={['a', 'b']}
      defaultPageSize={1}
      pageSizeOptions={[1]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('textbox', { name: 'Name for billing' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Page 1' }));
  expect(screen.getByRole('textbox', { name: 'Name for api-gateway' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Page 1' })).toHaveFocus();
});

it('consumes an Edit focus request before a virtualized row unmounts and remounts', async () => {
  const user = userEvent.setup();
  render(
    <>
      <button>Outside table</button>
      <DataTable
        rows={Array.from({ length: 100 }, (_, index) => ({ id: String(index), name: `Item ${index}`, quota: index }))}
        columns={columns}
        editMode="row"
        paginated={false}
        virtualize
      />
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Edit Item 0' }));
  expect(screen.getByRole('textbox', { name: 'Name for Item 0' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Outside table' }));
  const viewport = screen.getByRole('table').parentElement!;
  fireEvent.scroll(viewport, { target: { scrollTop: 2200 } });
  await vi.waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name for Item 0' })).toBeNull());
  fireEvent.scroll(viewport, { target: { scrollTop: 0 } });
  expect(await screen.findByRole('textbox', { name: 'Name for Item 0' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Outside table' })).toHaveFocus();
});

it('edits a whole row, tabs without saving, saves once and restores focus on save or Escape', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<DataTable rows={rows} columns={columns} editMode="row" onRowSave={save} />);
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  const name = screen.getByRole('textbox', { name: 'Name for api-gateway' });
  expect(name).toHaveFocus();
  await user.clear(name);
  await user.type(name, 'gateway');
  await user.tab();
  expect(screen.getByRole('spinbutton', { name: 'Quota for api-gateway' })).toHaveFocus();
  expect(save).not.toHaveBeenCalled();
  await user.clear(document.activeElement as HTMLInputElement);
  await user.keyboard('500{Enter}');
  expect(save).toHaveBeenCalledExactlyOnceWith({
    row: rows[0],
    rowId: 'a',
    values: { name: 'gateway', quota: 500 },
    previous: { name: 'api-gateway', quota: 100 },
  });
  expect(screen.getByRole('button', { name: 'Edit api-gateway' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), 'changed{Escape}');
  expect(save).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Edit api-gateway' })).toHaveFocus();
  expect(screen.getByText('api-gateway')).toBeVisible();
});

it('validates before row saves and links the field message to the editor', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={[{ ...columns[0]!, validate: (value) => (value ? undefined : 'Required') }, columns[1]!]}
      editMode="row"
      onRowSave={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  const input = screen.getByRole('textbox', { name: 'Name for api-gateway' });
  await user.clear(input);
  await user.keyboard('{Enter}');
  expect(save).not.toHaveBeenCalled();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Required');
});

it.each([
  { fieldErrors: { quota: 'Exceeds the plan limit' } },
  'Rejected by server',
  false,
  new Error('Network failed'),
])('keeps rejected rows editable: %s', async (result) => {
  const user = userEvent.setup();
  const save = vi.fn(() => {
    if (result instanceof Error) throw result;
    return result;
  });
  render(<DataTable rows={rows} columns={columns} editMode="row" onRowSave={save} />);
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), 'x{Enter}');
  expect(save).toHaveBeenCalledOnce();
  if (typeof result === 'object' && !(result instanceof Error)) {
    const quota = screen.getByRole('spinbutton', { name: 'Quota for api-gateway' });
    expect(quota).toHaveAttribute('aria-invalid', 'true');
    expect(quota).toHaveAccessibleDescription('Exceeds the plan limit');
  } else {
    expect(screen.getByRole('alert')).toHaveTextContent(
      result === false ? 'The change could not be saved.' : result instanceof Error ? result.message : String(result),
    );
  }
  expect(screen.getByRole('textbox', { name: 'Name for api-gateway' })).toBeVisible();
});

it('keeps controlled row drafts across pagination and sorting', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={rows}
      columns={columns}
      editMode="row"
      editingRowIds={['a', 'b']}
      defaultPageSize={1}
      pageSizeOptions={[1]}
    />,
  );
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), '-draft');
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for billing' }), '-draft');
  await user.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(screen.getByRole('textbox', { name: 'Name for api-gateway' })).toHaveValue('api-gateway-draft');
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('textbox', { name: 'Name for billing' })).toHaveValue('billing-draft');
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('textbox', { name: 'Name for api-gateway' })).toHaveValue('api-gateway-draft');
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('textbox', { name: 'Name for billing' })).toHaveValue('billing-draft');
});

it('keeps drafts when virtualized rows unmount and remount', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={Array.from({ length: 100 }, (_, index) => ({ id: String(index), name: `Item ${index}`, quota: index }))}
      columns={columns}
      editMode="row"
      editingRowIds={['0', '1']}
      paginated={false}
      virtualize
    />,
  );
  await user.type(screen.getByRole('textbox', { name: 'Name for Item 0' }), '-draft');
  const viewport = screen.getByRole('table').parentElement!;
  fireEvent.scroll(viewport, { target: { scrollTop: 2200 } });
  await vi.waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name for Item 0' })).toBeNull());
  fireEvent.scroll(viewport, { target: { scrollTop: 0 } });
  expect(await screen.findByRole('textbox', { name: 'Name for Item 0' })).toHaveValue('Item 0-draft');
});

it('saves changed drafts in one call, keeps only rejected rows and discards remaining edits', async () => {
  const user = userEvent.setup();
  const saveAll = vi.fn(() => ({ b: { fieldErrors: { quota: 'Limit exceeded' } } }));
  render(<DataTable rows={rows} columns={columns} editMode="row" onRowsSave={saveAll} />);
  for (const label of ['api-gateway', 'billing']) {
    await user.click(screen.getByRole('button', { name: `Edit ${label}` }));
    await user.type(screen.getByRole('textbox', { name: `Name for ${label}` }), '-draft');
  }
  expect(screen.getByRole('status')).toHaveTextContent('2 rows changed');
  await user.click(screen.getByRole('button', { name: 'Save all' }));
  expect(saveAll).toHaveBeenCalledExactlyOnceWith([
    {
      row: rows[0],
      rowId: 'a',
      values: { name: 'api-gateway-draft', quota: 100 },
      previous: { name: 'api-gateway', quota: 100 },
    },
    {
      row: rows[1],
      rowId: 'b',
      values: { name: 'billing-draft', quota: 200 },
      previous: { name: 'billing', quota: 200 },
    },
  ]);
  expect(screen.getByRole('button', { name: 'Edit api-gateway' })).toBeVisible();
  expect(screen.getByRole('spinbutton', { name: 'Quota for billing' })).toHaveAccessibleDescription('Limit exceeded');
  await user.click(screen.getByRole('button', { name: 'Discard all' }));
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText('billing')).toBeVisible();
});

it('validates every bulk draft before saving and discards two rows without saving', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={[{ ...columns[0]!, validate: (value) => (value ? undefined : 'Required') }, columns[1]!]}
      editMode="row"
      onRowsSave={save}
    />,
  );
  for (const label of ['api-gateway', 'billing']) {
    await user.click(screen.getByRole('button', { name: `Edit ${label}` }));
    await user.clear(screen.getByRole('textbox', { name: `Name for ${label}` }));
  }
  await user.click(screen.getByRole('button', { name: 'Save all' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
  for (const input of screen.getAllByRole('textbox')) expect(input).toHaveAccessibleDescription('Required');
  await user.click(screen.getByRole('button', { name: 'Discard all' }));
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText('api-gateway')).toBeVisible();
  expect(screen.getByText('billing')).toBeVisible();
});

it('ignores a cancelled pending row save when it eventually resolves', async () => {
  const user = userEvent.setup();
  let resolve!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  render(
    <>
      <DataTable rows={rows} columns={columns} editMode="row" onRowSave={save} />
      <button>After table</button>
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), '-draft{Enter}{Enter}{Escape}');
  expect(save).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'After table' }));
  await act(async () => resolve());
  expect(screen.getByRole('button', { name: 'After table' })).toHaveFocus();
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('discards a controlled draft when its owner removes the editing id', async () => {
  const user = userEvent.setup();
  const props = { rows, columns, editMode: 'row' as const };
  const view = render(<DataTable {...props} editingRowIds={['a']} />);
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), '-draft');
  view.rerender(<DataTable {...props} editingRowIds={[]} />);
  view.rerender(<DataTable {...props} editingRowIds={['a']} />);
  expect(screen.getByRole('textbox', { name: 'Name for api-gateway' })).toHaveValue('api-gateway');
});

it('leaves outside focus alone when the owner closes a controlled row', async () => {
  const user = userEvent.setup();
  const content = (ids: string[]) => (
    <>
      <button>Outside table</button>
      <DataTable rows={rows} columns={columns} editMode="row" editingRowIds={ids} />
    </>
  );
  const view = render(content(['a']));
  await user.click(screen.getByRole('button', { name: 'Outside table' }));
  view.rerender(content([]));
  expect(screen.getByRole('button', { name: 'Outside table' })).toHaveFocus();
});

it('does not move focus into a row when Save all accepts it', async () => {
  const user = userEvent.setup();
  render(<DataTable rows={rows} columns={columns} editMode="row" onRowsSave={() => ({ b: 'Try again' })} />);
  for (const label of ['api-gateway', 'billing']) {
    await user.click(screen.getByRole('button', { name: `Edit ${label}` }));
    await user.type(screen.getByRole('textbox', { name: `Name for ${label}` }), '-draft');
  }
  await user.click(screen.getByRole('button', { name: 'Save all' }));
  expect(screen.getByRole('button', { name: 'Save all' })).toHaveFocus();
});

it('closes both rows when independent async saves settle in the same turn', async () => {
  const user = userEvent.setup();
  const done: Array<() => void> = [];
  const save = vi.fn(() => new Promise<void>((resolve) => done.push(resolve)));
  render(<DataTable rows={rows} columns={columns} editMode="row" defaultEditingRowIds={['a', 'b']} onRowSave={save} />);
  const buttons = screen.getAllByRole('button', { name: 'Save' });
  await user.click(buttons[0]!);
  await user.click(buttons[1]!);
  await act(async () => {
    done[0]!();
    done[1]!();
  });
  expect(save).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('drops a deleted row from pending bulk edits after confirmation', async () => {
  const user = userEvent.setup();
  const saveAll = vi.fn();
  const remove = vi.fn();
  const props = { columns, editMode: 'row' as const, onRowsSave: saveAll, onRowDelete: remove };
  const view = render(<DataTable rows={rows} {...props} />);
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), '-draft');
  expect(screen.getByRole('button', { name: 'Save all' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Actions for api-gateway' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
  const dialog = screen.getByRole('alertdialog', { name: 'Delete api-gateway?' });
  await user.type(within(dialog).getByRole('textbox'), 'api-gateway');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  view.rerender(<DataTable rows={[rows[1]!]} {...props} />);
  expect(remove).toHaveBeenCalledExactlyOnceWith(rows[0]);
  expect(saveAll).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Save all' })).toBeNull();
});
