import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';

const rows = [{ id: 'a', name: 'api-gateway', value: 'initial' }];
type Row = (typeof rows)[number];
const column: DataTableColumn<Row> = { id: 'value', header: 'Value', accessor: (row) => row.value, editable: true };

it('validates cell edits before calling onCellEdit', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(
    <DataTable
      rows={rows}
      getRowLabel={(row) => row.name}
      columns={[{ ...column, validate: (value) => (value ? undefined : 'Required') }]}
      onCellEdit={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'initial' }));
  const input = screen.getByRole('textbox', { name: 'Value for api-gateway' });
  await user.clear(input);
  await user.keyboard('{Enter}');
  expect(save).not.toHaveBeenCalled();
  expect(input).toHaveAccessibleDescription('Required');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

it('uses a textarea with Shift+Enter for newlines and Enter for committing', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<DataTable rows={rows} columns={[{ ...column, editor: { type: 'textarea', rows: 3 } }]} onCellEdit={save} />);
  await user.click(screen.getByRole('button', { name: 'initial' }));
  const input = screen.getByRole('textbox', { name: 'Value for initial' });
  expect(input.tagName).toBe('TEXTAREA');
  expect(input).toHaveAttribute('rows', '3');
  await user.clear(input);
  await user.type(input, 'first{Shift>}{Enter}{/Shift}second');
  expect(save).not.toHaveBeenCalled();
  await user.keyboard('{Enter}');
  expect(save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: 'first\nsecond' }));
});

it.each([
  ['false', 'true'],
  ['true', 'false'],
])('uses a kit switch to report %s as %s', async (initial, next) => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(
    <DataTable
      rows={[{ ...rows[0]!, value: initial }]}
      columns={[{ ...column, editor: { type: 'switch' } }]}
      onCellEdit={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: initial }));
  await user.click(screen.getByRole('switch', { name: `Value for ${initial}` }));
  await user.keyboard('{Enter}');
  expect(save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: next }));
});

it('uses the kit date picker and commits a calendar date without a time zone shift', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(
    <DataTable
      rows={[{ ...rows[0]!, value: '2026-10-16' }]}
      columns={[{ ...column, editor: { type: 'date' } }]}
      onCellEdit={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: '2026-10-16' }));
  await user.click(screen.getByRole('combobox', { name: 'Value for 2026-10-16' }));
  await user.click(screen.getByRole('button', { name: /Saturday, October 17, 2026/ }));
  await vi.waitFor(() => expect(screen.getByRole('combobox', { name: 'Value for 2026-10-16' })).toHaveFocus());
  await user.keyboard('{Enter}');
  expect(save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: '2026-10-17' }));
});

it('uses a kit combobox and reports the option value', async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(
    <DataTable
      rows={rows}
      columns={[
        {
          ...column,
          editor: {
            type: 'combobox',
            options: [
              { value: 'initial', label: 'Initial' },
              { value: 'next', label: 'Next option' },
            ],
          },
        },
      ]}
      onCellEdit={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'initial' }));
  const input = screen.getByRole('combobox', { name: 'Value for initial' });
  await user.clear(input);
  await user.type(input, 'Next');
  await user.click(await screen.findByRole('option', { name: 'Next option' }));
  await user.keyboard('{Enter}');
  expect(save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: 'next' }));
});

it.each(['cell', 'row'] as const)('gives custom editors names, errors and mode-specific commit (%s)', async (mode) => {
  const user = userEvent.setup();
  const save = vi.fn(() => 'Not allowed');
  const renderEditor: NonNullable<DataTableColumn<Row>['renderEditor']> = (context) => (
    <div>
      <input
        {...context.inputProps}
        value={context.value ?? ''}
        onChange={(event) => context.setValue(event.target.value)}
      />
      <button onClick={context.commit}>Apply custom</button>
    </div>
  );
  render(
    <DataTable
      rows={rows}
      columns={[{ ...column, renderEditor, validate: (value) => (value === '' ? 'Required' : undefined) }]}
      editMode={mode}
      onCellEdit={save}
      onRowSave={save}
    />,
  );
  await user.click(screen.getByRole('button', { name: mode === 'cell' ? 'initial' : 'Edit initial' }));
  const input = screen.getByRole('textbox', { name: 'Value for initial' });
  await user.clear(input);
  if (mode === 'cell') await user.click(screen.getByRole('button', { name: 'Apply custom' }));
  else await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Required');
  expect(save).not.toHaveBeenCalled();
  await user.type(input, 'custom');
  await user.click(screen.getByRole('button', { name: 'Apply custom' }));
  if (mode === 'row') {
    expect(save).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
  }
  expect(save).toHaveBeenCalledOnce();
});

it.each(['top', 'bottom'] as const)(
  'adds one %s draft with defaults, saves it once and returns focus when cancelled',
  async (position) => {
    const user = userEvent.setup();
    const add = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={[column]}
        getRowLabel={(row) => row.name}
        onRowAdd={add}
        newRowPosition={position}
        newRowDefaults={() => ({ value: 'seed' })}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Add row' });
    await user.click(trigger);
    const input = screen.getByRole('textbox', { name: 'Value for Add row' });
    expect(input).toHaveValue('seed');
    expect(input).toHaveFocus();
    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(within(position === 'top' ? bodyRows[0]! : bodyRows.at(-1)!).getByRole('textbox')).toBe(input);
    await user.type(input, '-new{Enter}');
    expect(add).toHaveBeenCalledExactlyOnceWith({ value: 'seed-new' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(add).toHaveBeenCalledOnce();
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(trigger).toHaveFocus();
  },
);

it('appends Delete, confirms the named row and moves focus after the consumer removes it', async () => {
  const user = userEvent.setup();
  const remove = vi.fn();
  const first = rows[0]!;
  const second = { id: 'b', name: 'billing', value: 'second' };
  const props = {
    columns: [column],
    getRowLabel: (row: Row) => row.name,
    onRowDelete: remove,
    rowActions: () => [{ label: 'Inspect', onSelect: vi.fn() }],
  };
  const view = render(<DataTable rows={[first, second]} {...props} />);
  const trigger = screen.getByRole('button', { name: 'Actions for api-gateway' });
  await user.click(trigger);
  expect((await screen.findAllByRole('menuitem')).at(-1)).toHaveTextContent('Delete');
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
  let dialog = screen.getByRole('alertdialog', { name: 'Delete api-gateway?' });
  await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(remove).not.toHaveBeenCalled();
  await vi.waitFor(() => expect(trigger).toHaveFocus());
  await user.click(trigger);
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
  dialog = screen.getByRole('alertdialog', { name: 'Delete api-gateway?' });
  await user.type(within(dialog).getByRole('textbox'), 'api-gateway');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  expect(remove).toHaveBeenCalledExactlyOnceWith(first);
  view.rerender(<DataTable rows={[second]} {...props} />);
  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Actions for billing' })).toHaveFocus());
});

it('translates add, edit, editor names and the delete dialog in Spanish', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <DataTable
        rows={rows}
        columns={[column]}
        getRowLabel={(row) => row.name}
        editMode="row"
        onRowAdd={vi.fn()}
        onRowDelete={vi.fn()}
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Añadir fila' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Editar api-gateway' }));
  expect(screen.getByRole('textbox', { name: 'Value de api-gateway' })).toHaveFocus();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Acciones de api-gateway' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Eliminar' }));
  const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar api-gateway?' });
  expect(within(dialog).getByRole('textbox')).toHaveAccessibleName('Escribe api-gateway para confirmar');
});

it('focuses a date when it is the first row editor', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={[{ ...rows[0]!, value: '2026-10-17' }]}
      columns={[{ ...column, editor: { type: 'date' } }]}
      editMode="row"
      onRowSave={vi.fn()}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Edit 2026-10-17' }));
  expect(screen.getByRole('combobox', { name: 'Value for 2026-10-17' })).toHaveFocus();
});

it('returns focus to the previous actions trigger when deleting the last row', async () => {
  const user = userEvent.setup();
  const second = { id: 'b', name: 'billing', value: 'second' };
  const remove = vi.fn();
  const props = { columns: [column], getRowLabel: (row: Row) => row.name, onRowDelete: remove };
  const view = render(<DataTable rows={[rows[0]!, second]} {...props} />);
  await user.click(screen.getByRole('button', { name: 'Actions for billing' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
  const dialog = screen.getByRole('alertdialog', { name: 'Delete billing?' });
  await user.type(within(dialog).getByRole('textbox'), 'billing');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  view.rerender(<DataTable rows={rows} {...props} />);
  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Actions for api-gateway' })).toHaveFocus());
  expect(remove).toHaveBeenCalledExactlyOnceWith(second);
});

it('replaces the empty state with an added draft and restores it on cancel', async () => {
  const user = userEvent.setup();
  render(<DataTable rows={[]} columns={[column]} onRowAdd={vi.fn()} emptyState={<span>No entries</span>} />);
  expect(screen.getByText('No entries')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Add row' }));
  expect(screen.queryByText('No entries')).toBeNull();
  await user.keyboard('{Escape}');
  expect(screen.getByText('No entries')).toBeVisible();
});

it('retains legacy cell labels without new editing props under a Spanish provider', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <DataTable rows={rows} columns={[column]} getRowLabel={(row) => row.name} onCellEdit={vi.fn()} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'initial' }));
  expect(screen.getByRole('textbox', { name: 'Value for api-gateway' })).toHaveFocus();
});

it.each([1, 2])('restores deletion focus across client page boundaries (page %s)', async (page) => {
  const user = userEvent.setup();
  const second = { id: 'b', name: 'billing', value: 'second' };
  const label = page === 1 ? 'api-gateway' : 'billing';
  const remaining = page === 1 ? [second] : rows;
  const props = {
    columns: [column],
    getRowLabel: (row: Row) => row.name,
    onRowDelete: vi.fn(),
    defaultPage: page,
    defaultPageSize: 1,
    pageSizeOptions: [1],
  };
  const view = render(<DataTable rows={[rows[0]!, second]} {...props} />);
  await user.click(screen.getByRole('button', { name: `Actions for ${label}` }));
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
  const dialog = screen.getByRole('alertdialog', { name: `Delete ${label}?` });
  await user.type(within(dialog).getByRole('textbox'), label);
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  view.rerender(<DataTable rows={remaining} {...props} />);
  await vi.waitFor(() =>
    expect(screen.getByRole('button', { name: `Actions for ${remaining[0]!.name}` })).toHaveFocus(),
  );
});

it.each([42, null])(
  'commits the custom editor value %s without string coercion, including a same-event commit',
  async (next) => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={[
          {
            ...column,
            renderEditor: (context) => (
              <div>
                <input
                  {...context.inputProps}
                  value={context.value ?? ''}
                  onChange={(event) => context.setValue(event.target.value)}
                />
                <button
                  onClick={() => {
                    context.setValue(next);
                    context.commit();
                  }}
                >
                  Apply typed value
                </button>
              </div>
            ),
          },
        ]}
        onCellEdit={save}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'initial' }));
    await user.click(screen.getByRole('button', { name: 'Apply typed value' }));
    expect(save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: next, previous: 'initial' }));
  },
);
