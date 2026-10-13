import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { FilterBar } from '../FilterBar/FilterBar';
import { DataTable } from '../DataTable/DataTable';
import { baseline, themes } from './matrix';

// Captured at dde54ce4a82f122f5c0c10bc6e8e300f72484c8c, before source changes.
// No labels prop; fixed data and keyboard actions, including portals and sr-only copy.
for (const locale of ['en', 'es'])
  for (const theme of themes) {
    it(`baseline strings, roles, focus and callbacks: ${locale}/${theme}`, async () => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      const messages =
        locale === 'es'
          ? {
              next: 'Página siguiente',
              previous: 'Página anterior',
              page: 'Página',
              rows: 'Filas por página',
              search: 'Buscar',
              saved: 'Vista guardada',
              add: 'Añadir filtro',
              columns: 'Columnas',
            }
          : {
              next: 'Next page',
              previous: 'Previous page',
              page: 'Page',
              rows: 'Rows per page',
              search: 'Search',
              saved: 'Saved view',
              add: 'Add filter',
              columns: 'Columns',
            };
      const states: Record<string, unknown> = {};
      const record = (name: string) => {
        states[name] = baseline();
      };
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      render(
        <I18nProvider locale={locale}>
          <PaginationFooter onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </I18nProvider>,
      );
      record('pagination.initial');
      screen.getByRole('button', { name: messages.next }).focus();
      await user.keyboard('{Enter}');
      record('pagination.next');
      await user.click(screen.getByRole('button', { name: messages.previous }));
      record('pagination.previous');
      await user.click(screen.getByRole('button', { name: `${messages.page} 2` }));
      record('pagination.page');
      await user.click(screen.getByRole('combobox', { name: messages.rows }));
      await screen.findByRole('option', { name: '25' });
      await waitFor(() => expect(screen.getByRole('option', { name: '10' })).toHaveFocus());
      record('pagination.select-open');
      await user.click(await screen.findByRole('option', { name: '25' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      record('pagination.resized');
      states['pagination.callbacks'] = { page: onPageChange.mock.calls, size: onPageSizeChange.mock.calls };
      cleanup();
      const onFiltersChange = vi.fn();
      const onQueryChange = vi.fn();
      const onViewChange = vi.fn();
      const filterProps = {
        fields: [{ id: 'kind', label: 'Kind', options: ['A', 'B'] }],
        defaultFilters: [],
        views: [{ value: 'a', label: 'Choice A', filters: [{ field: 'kind', value: 'A' }] }],
      };
      const filter = render(
        <I18nProvider locale={locale}>
          <FilterBar
            {...filterProps}
            resultCount={1}
            onFiltersChange={onFiltersChange}
            onQueryChange={onQueryChange}
            onViewChange={onViewChange}
          />
        </I18nProvider>,
      );
      record('filters.initial');
      await user.click(screen.getByRole('combobox', { name: messages.saved }));
      await screen.findByRole('option', { name: 'Choice A' });
      await waitFor(() => expect(screen.getByRole('listbox').parentElement).toHaveFocus());
      record('filters.views-open');
      await user.click(await screen.findByRole('option', { name: 'Choice A' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      record('filters.view-picked');
      await user.click(screen.getByRole('button', { name: messages.add }));
      await screen.findByRole('menuitemcheckbox', { name: 'B' });
      await waitFor(() => expect(screen.getByRole('menu')).toHaveFocus());
      record('filters.menu-open');
      await user.click(await screen.findByRole('menuitemcheckbox', { name: 'B' }));
      await user.keyboard('{Escape}');
      record('filters.checked');
      const remove = screen.getByRole('button', {
        name: locale === 'es' ? 'Quitar filtro Kind: B' : 'Remove filter Kind: B',
      });
      remove.focus();
      record('filters.remove-focused');
      await user.keyboard('{Enter}');
      record('filters.removed');
      await user.type(screen.getByRole('searchbox', { name: messages.search }), 'query');
      await user.click(screen.getByRole('button', { name: 'Clear all' }));
      record('filters.cleared');
      filter.rerender(
        <I18nProvider locale={locale}>
          <FilterBar {...filterProps} resultCount={1234} />
        </I18nProvider>,
      );
      record('filters.count-N');
      states['filters.callbacks'] = {
        filters: onFiltersChange.mock.calls,
        query: onQueryChange.mock.calls,
        view: onViewChange.mock.calls,
      };
      cleanup();
      const onHiddenColumnsChange = vi.fn();
      const onDensityChange = vi.fn();
      const onViewsChange = vi.fn();
      const onSelectionChange = vi.fn();
      const onCellEdit = vi.fn();
      const columns = [
        {
          id: 'name',
          header: 'Name',
          accessor: (row: { id: string; name: string; group: string }) => row.name,
          editable: true,
          sortable: true,
        },
        { id: 'group', header: 'Category', accessor: (row: { group: string }) => row.group },
      ];
      const props = {
        rows: [
          { id: 'a', name: 'Item A', group: 'G' },
          { id: 'b', name: 'Item B', group: '' },
        ],
        columns,
        caption: 'Items',
        groupBy: 'group' as const,
        defaultViews: [{ id: 'one', name: 'Choice A', state: {} }],
        showPinMenu: true,
        resizable: true,
        onHiddenColumnsChange,
        onDensityChange,
        onViewsChange,
        onSelectionChange,
        onCellEdit,
      };
      const table = render(
        <I18nProvider locale={locale}>
          <DataTable {...props} />
        </I18nProvider>,
      );
      record('table.initial-grouped-editable');
      await user.click(screen.getByRole('button', { name: messages.columns }));
      await screen.findByRole('menuitemcheckbox', { name: 'Category' });
      await waitFor(() => expect(screen.getByRole('menu')).toHaveFocus());
      record('table.columns-open');
      await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Category' }));
      record('table.column-toggled');
      const pin = screen.getByRole('menuitem', { name: 'Name' });
      pin.focus();
      await user.keyboard('{ArrowRight}');
      await screen.findByRole('menuitemradio', { name: 'Pin left' });
      await waitFor(() => expect(screen.getByRole('menuitemradio', { name: 'Pin left' })).toHaveFocus());
      record('table.pin-submenu');
      await user.click(screen.getByRole('menuitemradio', { name: 'Pin left' }));
      await user.keyboard('{Escape}{Escape}');
      await waitFor(() => expect(screen.getByRole('button', { name: messages.columns })).toHaveFocus());
      record('table.pinned');
      await user.click(screen.getByRole('button', { name: locale === 'es' ? 'Filas compactas' : 'Compact rows' }));
      record('table.compact');
      await user.click(screen.getByRole('button', { name: locale === 'es' ? 'Filas holgadas' : 'Comfortable rows' }));
      record('table.comfortable');
      const openViews = async () =>
        user.click(screen.getByRole('button', { name: /^(Default view|Choice A|New choice|Renamed)/ }));
      await openViews();
      await screen.findByRole('menuitem', { name: 'Save as new view…' });
      await waitFor(() => expect(screen.getByRole('menu')).toHaveFocus());
      record('table.views-open');
      await user.click(await screen.findByRole('menuitem', { name: 'Save as new view…' }));
      let dialog = await screen.findByRole('dialog', { name: 'Save view' });
      record('table.save-dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      record('table.cancelled');
      await openViews();
      await user.click(await screen.findByRole('menuitem', { name: 'Save as new view…' }));
      dialog = await screen.findByRole('dialog');
      await user.type(within(dialog).getByRole('textbox', { name: 'View name' }), 'New choice{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      record('table.saved');
      await openViews();
      await user.click(await screen.findByRole('menuitem', { name: 'Rename view…' }));
      dialog = await screen.findByRole('dialog', { name: 'Rename view' });
      record('table.rename-dialog');
      await user.clear(within(dialog).getByRole('textbox', { name: 'View name' }));
      await user.type(within(dialog).getByRole('textbox', { name: 'View name' }), 'Renamed{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      record('table.renamed');
      await openViews();
      await user.click(await screen.findByRole('menuitem', { name: 'Delete view' }));
      await waitFor(() => expect(screen.getByRole('button', { name: /Default view/ })).toHaveFocus());
      record('table.deleted');
      await user.click(
        screen.getByRole('checkbox', { name: locale === 'es' ? 'Seleccionar Item A' : 'Select Item A' }),
      );
      record('table.selected');
      table.rerender(
        <I18nProvider locale={locale}>
          <DataTable {...props} loading />
        </I18nProvider>,
      );
      record('table.loading');
      table.rerender(
        <I18nProvider locale={locale}>
          <DataTable {...props} rows={[]} />
        </I18nProvider>,
      );
      record('table.empty');
      states['table.callbacks'] = {
        hidden: onHiddenColumnsChange.mock.calls,
        density: onDensityChange.mock.calls,
        views: onViewsChange.mock.calls,
        selection: onSelectionChange.mock.calls,
        edits: onCellEdit.mock.calls,
      };
      // One compact JSON line per state: reviewable and independent of generated element ids.
      await expect(
        Object.entries(states)
          .map(([name, state]) => JSON.stringify({ name, state }))
          .join('\n') + '\n',
      ).toMatchFileSnapshot(`./baselines/dde54ce-${locale}-${theme}.jsonl`);
    }, 120000);
  }
