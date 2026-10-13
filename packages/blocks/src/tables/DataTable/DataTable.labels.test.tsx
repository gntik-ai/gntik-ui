import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';
import { tableLabels } from '../__tests__/labels-fixtures';

it('forwards labels through column, density and saved-view interactions', async () => {
  const user = userEvent.setup();
  const l = tableLabels.es;
  const onViewsChange = vi.fn();
  render(
    <I18nProvider locale="en">
      <DataTable labels={l} showPinMenu defaultViews={[]} onViewsChange={onViewsChange} />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: l.density.label })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: l.density.compact }));
  expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
  await user.click(screen.getByRole('button', { name: l.columnMenu.trigger }));
  expect(await screen.findByText(l.columnMenu.visibleColumns)).toBeInTheDocument();
  expect(screen.getByText(l.columnMenu.pinColumns)).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: l.views.defaultView }));
  expect(await screen.findByText(l.views.heading)).toBeInTheDocument();
  await user.click(screen.getByRole('menuitem', { name: l.views.saveAs }));
  const dialog = await screen.findByRole('dialog', { name: l.views.saveTitle });
  expect(within(dialog).getByRole('button', { name: l.views.close })).toBeInTheDocument();
  await user.type(within(dialog).getByRole('textbox', { name: l.views.name }), 'A{Enter}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(onViewsChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'A' })]);
});

it('replaces selection, grouping, loading, empty, resize and edit surfaces with raw formatter args', async () => {
  const user = userEvent.setup();
  const l = tableLabels.es;
  const labels = {
    ...l,
    selection: { ...l.selection, selectedCount: vi.fn(() => 'Exact selection') },
    grouping: {
      ...l.grouping,
      groupRowCount: vi.fn(() => 'Exact group'),
      selectGroup: vi.fn((name: string) => `Grupo ${name}`),
    },
    loading: vi.fn((caption: string) => `Exact loading ${caption}`),
  };
  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessor: (row: { id: string; name: string; group: string }) => row.name,
      editable: true,
    },
  ];
  const props = {
    rows: [{ id: 'a', name: 'A', group: '' }],
    columns,
    caption: 'Caller Caption',
    groupBy: 'group' as const,
    resizable: true,
    onCellEdit: () => false,
    rowActions: () => [{ label: 'Caller action', onClick: () => undefined }],
  };
  const { rerender } = render(<DataTable {...props} labels={labels} />);
  expect(screen.getByRole('checkbox', { name: labels.selection.selectAll })).toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: labels.selection.selectRow('A') })).toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'Grupo Sin grupo' })).toBeInTheDocument();
  expect(labels.grouping.selectGroup).toHaveBeenCalledWith('Sin grupo');
  expect(labels.grouping.groupRowCount).toHaveBeenCalledWith(1);
  expect(screen.getByRole('button', { name: 'Sin grupo Exact group' })).toBeInTheDocument();
  expect(screen.getByRole('separator', { name: 'Ajustar columna Name' })).toHaveAttribute(
    'aria-valuetext',
    '160 píxeles',
  );
  expect(screen.getByRole('button', { name: labels.actions.rowActions('A') })).toBeInTheDocument();
  const cell = screen.getByRole('button', { name: 'A' });
  expect(cell).toHaveAccessibleDescription(labels.editHint);
  await user.click(cell);
  const input = screen.getByRole('textbox', { name: 'Name de A' });
  await user.clear(input);
  await user.type(input, 'B{Enter}');
  expect(await screen.findByRole('alert')).toHaveTextContent(labels.edit.saveError);
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('checkbox', { name: labels.selection.selectRow('A') }));
  expect(labels.selection.selectedCount).toHaveBeenLastCalledWith(1);
  expect(document.querySelector('[aria-live]')?.textContent).toBe('Exact selection');
  rerender(<DataTable {...props} labels={labels} loading />);
  expect(screen.getByRole('status')).toHaveTextContent('Exact loading Caller Caption');
  expect(labels.loading).toHaveBeenLastCalledWith('Caller Caption');
  rerender(<DataTable {...props} rows={[]} labels={labels} />);
  expect(screen.getByText(labels.empty.title)).toBeInTheDocument();
  expect(screen.getByText(labels.empty.description)).toBeInTheDocument();
});
