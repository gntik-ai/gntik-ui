import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './data-table-utils';
import { tableLabels } from '../__tests__/labels-fixtures';
import { assertInventory, baseline, checkAxe, themes } from '../__tests__/matrix';

interface Row {
  id: string;
  name: string;
  group: string;
  amount: number;
}
const rows: Row[] = [
  { id: 'a', name: 'A', group: 'G', amount: 1 },
  { id: 'b', name: 'B', group: 'G', amount: 2 },
  { id: 'c', name: 'C', group: '', amount: 3 },
];
const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, editable: true },
  { id: 'group', header: 'Category', accessor: (row) => row.group },
  {
    id: 'amount',
    header: 'Amount',
    accessor: (row) => row.amount,
    editable: true,
    editor: { type: 'number', min: 0, max: 10 },
  },
];

const allStrings = (object: object): string[] =>
  Object.values(object).flatMap((value: unknown) =>
    typeof value === 'string' ? [value] : value !== null && typeof value === 'object' ? allStrings(value) : [],
  );

for (const mode of ['default', 'en', 'es'] as const)
  for (const theme of themes) {
    it(`all table chrome states: ${mode}/${theme}`, async () => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      const states: ReturnType<typeof baseline>[] = [];
      const observe = () => {
        if (mode === 'default') states.push(baseline());
      };
      const l = tableLabels[mode === 'es' ? 'es' : 'en'];
      const selectedCount = vi.fn(l.selection.selectedCount);
      const groupRowCount = vi.fn(l.grouping.groupRowCount);
      const selectGroup = vi.fn(l.grouping.selectGroup);
      const loading = vi.fn(l.loading);
      const labels =
        mode === 'default'
          ? undefined
          : {
              ...l,
              selection: { ...l.selection, selectedCount },
              grouping: { ...l.grouping, groupRowCount, selectGroup },
              loading,
            };
      const onViewsChange = vi.fn();
      const onActiveViewChange = vi.fn();
      const onHiddenColumnsChange = vi.fn();
      const onPinnedColumnsChange = vi.fn();
      const onDensityChange = vi.fn();
      const onSelectionChange = vi.fn();
      const onCellEdit = vi.fn(() => false);
      const props = {
        rows,
        columns,
        caption: 'A',
        labels,
        groupBy: 'group' as const,
        resizable: true,
        showPinMenu: true,
        defaultViews: [{ id: 'choice', name: 'Choice A', state: {} }],
        onViewsChange,
        onActiveViewChange,
        onHiddenColumnsChange,
        onPinnedColumnsChange,
        onDensityChange,
        onSelectionChange,
        onCellEdit,
        rowActions: () => [{ label: 'Action', onClick: () => undefined }],
      };
      const { rerender } = render(<DataTable {...props} />);
      const allowed = [
        ...allStrings(l),
        ...['A', 'B', 'C'].flatMap((name) => [
          l.selection.selectRow(name),
          l.actions.rowActions(name),
          l.edit.label('Name', name),
          l.edit.label('Amount', name),
        ]),
        l.grouping.selectGroup('G'),
        l.grouping.selectGroup(l.grouping.noGroup),
        l.grouping.groupRowCount(1),
        l.grouping.groupRowCount(2),
        ...[1, 2, 3].map(l.selection.selectedCount),
        l.loading('A'),
        ...['Name', 'Category', 'Amount'].map(l.resize.column),
        ...[160, 170].map(l.resize.value),
        l.columnMenu.pinSide('left'),
        l.columnMenu.pinSide('right'),
        l.edit.minimum(0),
        l.edit.maximum(10),
        l.pagination.pagination('A'),
        l.pagination.page(1),
        l.pagination.rangeSummary(1, 3, 3),
        ...(mode === 'default' ? ['row', 'rows', 'selected', 'Loading', 'a', '…', 'of', '1–3'] : []),
      ];
      const check = async () => {
        expect(screen.getByRole('group', { name: l.density.label })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.density.comfortable })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.density.compact })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.columnMenu.trigger })).toHaveTextContent(l.columnMenu.trigger);
        expect(screen.getByRole('checkbox', { name: l.selection.selectAll })).toBeInTheDocument();
        assertInventory(allowed, [
          'A',
          'B',
          'C',
          'G',
          'Name',
          'Category',
          'Amount',
          'Choice A',
          'New choice',
          'Renamed',
          'Action',
          '1',
          '2',
          '3',
          '10',
          '25',
          '50',
        ]);
        await checkAxe();
        observe();
      };
      const closeMenu = async () => {
        await user.keyboard('{Escape}{Escape}');
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
      };
      const openColumns = async () => {
        await user.click(screen.getByRole('button', { name: l.columnMenu.trigger }));
        await screen.findByRole('menu');
        await screen.findByRole('menuitemcheckbox', { name: 'Category' });
      };
      const openViews = async () => {
        await user.click(
          screen.getByRole('button', { name: /^(Default view|Vista inicial|Choice A|New choice|Renamed)/ }),
        );
        await screen.findByRole('menuitem', { name: l.views.saveAs });
      };
      await check();
      expect(screen.getByRole('button', { name: 'A' })).toHaveAccessibleDescription(l.editHint);
      for (const name of ['A', 'B', 'C']) {
        expect(screen.getByRole('checkbox', { name: l.selection.selectRow(name) })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.actions.rowActions(name) })).toBeInTheDocument();
      }
      expect(screen.getByRole('columnheader', { name: l.actions.heading })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `G ${l.grouping.groupRowCount(2)}` })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: `${l.grouping.noGroup} ${l.grouping.groupRowCount(1)}` }),
      ).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: l.grouping.selectGroup('G') })).toBeInTheDocument();
      if (mode !== 'default') {
        expect(groupRowCount).toHaveBeenCalledWith(2);
        expect(groupRowCount).toHaveBeenCalledWith(1);
        expect(selectGroup).toHaveBeenCalledWith('G');
      }
      await user.click(screen.getByRole('button', { name: `G ${l.grouping.groupRowCount(2)}` }));
      await check();
      await user.click(screen.getByRole('button', { name: `G ${l.grouping.groupRowCount(2)}` }));
      await check();
      const resize = screen.getByRole('separator', { name: l.resize.column('Name') });
      expect(resize).toHaveAttribute('aria-valuetext', l.resize.value(160));
      resize.focus();
      await user.keyboard('{ArrowRight}');
      expect(resize).toHaveAttribute('aria-valuetext', l.resize.value(170));
      await check();
      await openColumns();
      expect(screen.getByText(l.columnMenu.visibleColumns)).toBeInTheDocument();
      expect(screen.getByText(l.columnMenu.pinColumns)).toBeInTheDocument();
      await check();
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'Category' }));
      expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(['group']);
      expect(screen.queryByRole('columnheader', { name: 'Category' })).toBeNull();
      await check();
      screen.getByRole('menuitem', { name: 'Name' }).focus();
      await user.keyboard('{ArrowRight}');
      await screen.findByRole('menuitemradio', { name: l.columnMenu.pinLeft });
      for (const label of [l.columnMenu.pinLeft, l.columnMenu.pinRight, l.columnMenu.unpinned])
        expect(screen.getByRole('menuitemradio', { name: label })).toHaveTextContent(label);
      await check();
      await user.click(screen.getByRole('menuitemradio', { name: l.columnMenu.pinLeft }));
      await closeMenu();
      expect(onPinnedColumnsChange).toHaveBeenLastCalledWith({ left: ['name'], right: [] });
      await check();
      await openColumns();
      expect(screen.getByRole('menuitem', { name: `Name${l.columnMenu.pinSide('left')}` })).toBeInTheDocument();
      screen.getByRole('menuitem', { name: `Name${l.columnMenu.pinSide('left')}` }).focus();
      await user.keyboard('{ArrowRight}');
      await user.click(await screen.findByRole('menuitemradio', { name: l.columnMenu.pinRight }));
      await closeMenu();
      await openColumns();
      expect(screen.getByRole('menuitem', { name: `Name${l.columnMenu.pinSide('right')}` })).toBeInTheDocument();
      await check();
      screen.getByRole('menuitem', { name: `Name${l.columnMenu.pinSide('right')}` }).focus();
      await user.keyboard('{ArrowRight}');
      await user.click(await screen.findByRole('menuitemradio', { name: l.columnMenu.unpinned }));
      await closeMenu();
      await user.click(screen.getByRole('button', { name: l.density.compact }));
      expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
      expect(onDensityChange).toHaveBeenLastCalledWith('compact');
      await check();
      await user.click(screen.getByRole('button', { name: l.density.comfortable }));
      expect(screen.getByRole('table')).toHaveAttribute('data-density', 'comfortable');
      await check();
      expect(screen.getByRole('button', { name: `${l.views.defaultView} ${l.views.modified}` })).toBeInTheDocument();
      await openViews();
      expect(screen.getByText(l.views.heading)).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: l.views.defaultView })).toHaveTextContent(l.views.defaultView);
      for (const label of [
        l.views.saveChanges,
        l.views.saveAs,
        l.views.renameView,
        l.views.deleteView,
        l.views.resetChanges,
      ])
        expect(screen.getByRole('menuitem', { name: label })).toHaveTextContent(label);
      await check();
      await user.click(screen.getByRole('menuitem', { name: l.views.saveAs }));
      let dialog = await screen.findByRole('dialog', { name: l.views.saveTitle });
      expect(within(dialog).getByRole('textbox', { name: l.views.name })).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: l.views.save })).toHaveTextContent(l.views.save);
      expect(within(dialog).getByRole('button', { name: l.views.close })).toBeInTheDocument();
      assertInventory(allowed, ['A', 'B', 'C', 'G', 'Name', 'Category', 'Amount', 'Choice A', '1', '2', '3', '10']);
      await checkAxe();
      observe();
      await user.click(within(dialog).getByRole('button', { name: l.views.cancel }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(onViewsChange).not.toHaveBeenCalled();
      await check();
      await openViews();
      await user.click(screen.getByRole('menuitem', { name: l.views.saveAs }));
      dialog = await screen.findByRole('dialog');
      await user.type(within(dialog).getByRole('textbox', { name: l.views.name }), 'New choice{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(onViewsChange).toHaveBeenCalledWith([
        props.defaultViews[0],
        expect.objectContaining({ name: 'New choice' }),
      ]);
      await check();
      await openViews();
      await user.click(screen.getByRole('menuitem', { name: l.views.renameView }));
      dialog = await screen.findByRole('dialog', { name: l.views.renameTitle });
      expect(within(dialog).getByRole('button', { name: l.views.rename })).toHaveTextContent(l.views.rename);
      expect(within(dialog).getByRole('textbox', { name: l.views.name })).toHaveValue('New choice');
      await checkAxe();
      observe();
      await user.click(within(dialog).getByRole('button', { name: l.views.close }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await check();
      await openViews();
      await user.click(screen.getByRole('menuitem', { name: l.views.renameView }));
      dialog = await screen.findByRole('dialog');
      const nameField = within(dialog).getByRole('textbox', { name: l.views.name });
      await user.clear(nameField);
      await user.type(nameField, 'Renamed{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await check();
      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(screen.getByRole('button', { name: `Renamed ${l.views.modified}` })).toBeInTheDocument();
      await check();
      await openViews();
      await user.click(screen.getByRole('menuitem', { name: l.views.saveChanges }));
      await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
      expect(screen.getByRole('button', { name: 'Renamed' })).toBeInTheDocument();
      await check();
      await user.click(screen.getByRole('button', { name: 'Name' }));
      await openViews();
      await user.click(screen.getByRole('menuitem', { name: l.views.resetChanges }));
      await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
      await check();
      await openViews();
      await user.click(screen.getByRole('menuitem', { name: l.views.deleteView }));
      await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
      expect(onViewsChange.mock.lastCall?.[0]).toHaveLength(1);
      await check();
      await openViews();
      await user.click(screen.getByRole('menuitemradio', { name: 'Choice A' }));
      await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
      expect(onActiveViewChange).toHaveBeenLastCalledWith('choice');
      await check();
      await user.click(screen.getByRole('checkbox', { name: l.selection.selectRow('A') }));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['a']);
      expect(document.querySelector('[aria-live]')?.textContent).toBe(l.selection.selectedCount(1));
      if (mode !== 'default') expect(selectedCount).toHaveBeenLastCalledWith(1);
      await check();
      await user.click(screen.getByRole('checkbox', { name: l.grouping.selectGroup('G') }));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['a', 'b']);
      await check();
      await user.click(screen.getByRole('button', { name: 'A' }));
      const input = screen.getByRole('textbox', { name: l.edit.label('Name', 'A') });
      expect(input).toHaveAccessibleName(l.edit.label('Name', 'A'));
      await check();
      await user.clear(input);
      await user.type(input, 'D{Enter}');
      expect(await screen.findByRole('alert')).toHaveTextContent(l.edit.saveError);
      await check();
      await user.keyboard('{Escape}');
      await user.click(within(screen.getByRole('row', { name: /B/ })).getByRole('button', { name: '2' }));
      const number = screen.getByRole('spinbutton', { name: l.edit.label('Amount', 'B') });
      await user.clear(number);
      await user.type(number, '20{Enter}');
      expect(screen.getByRole('alert')).toHaveTextContent(l.edit.maximum(10));
      await check();
      await user.clear(number);
      await user.type(number, '-1{Enter}');
      expect(screen.getByRole('alert')).toHaveTextContent(l.edit.minimum(0));
      await check();
      await user.keyboard('{Escape}');
      rerender(<DataTable {...props} loading />);
      expect(screen.getByRole('status').textContent).toBe(l.loading('A'));
      if (mode !== 'default') expect(loading).toHaveBeenLastCalledWith('A');
      await check();
      rerender(<DataTable {...props} rows={[]} />);
      expect(screen.getByText(l.empty.title)).toBeInTheDocument();
      expect(screen.getByText(l.empty.description)).toBeInTheDocument();
      await check();
      rerender(<DataTable {...props} virtualize />);
      expect(screen.getByRole('region', { name: mode === 'default' ? 'A' : l.scrollContainer })).toBeInTheDocument();
      await check();
      rerender(<DataTable {...props} selectionMode="single" paginated={false} legend="Caller selection" />);
      expect(screen.getByRole('columnheader', { name: l.selection.heading })).toBeInTheDocument();
      await checkAxe();
      observe();
      if (mode === 'default')
        await expect(
          [
            ...states,
            {
              callbacks: {
                views: onViewsChange.mock.calls,
                active: onActiveViewChange.mock.calls,
                hidden: onHiddenColumnsChange.mock.calls,
                pin: onPinnedColumnsChange.mock.calls,
                density: onDensityChange.mock.calls,
                selection: onSelectionChange.mock.calls,
                edits: onCellEdit.mock.calls,
              },
            },
          ]
            .map((state) => JSON.stringify(state))
            .join('\n') + '\n',
        ).toMatchFileSnapshot(`../__tests__/baselines/dde54ce-table-${theme}.jsonl`);
    }, 120000);
  }
