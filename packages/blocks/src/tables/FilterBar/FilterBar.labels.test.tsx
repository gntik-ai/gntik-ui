import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { FilterBar, type FilterBarLabels } from './FilterBar';

it('replaces filter chrome including removed chips, saved views and the live result count', async () => {
  const user = userEvent.setup();
  const removeFilter = vi.fn((field: string, value: string) => `Quitar ${field}|${value}`);
  const resultCount = vi.fn((count: number) => `Encontrados: ${count}`);
  const labels: FilterBarLabels = {
    searchLandmark: 'Filtrar',
    searchLabel: 'Buscar registros',
    searchPlaceholder: 'Escriba…',
    savedViewLabel: 'Vista guardada',
    savedViewPlaceholder: 'Vistas guardadas',
    addFilter: 'Añadir filtro',
    activeFilters: 'Filtros activos',
    filters: 'Filtros',
    clearAll: 'Borrar todo',
    removeFilter,
    resultCount,
  };
  const { container } = render(<FilterBar labels={labels} resultCount={1200} />);
  expect(screen.getByRole('search', { name: 'Filtrar' })).toBeVisible();
  expect(screen.getByRole('searchbox', { name: 'Buscar registros' })).toHaveAttribute('placeholder', 'Escriba…');
  expect(screen.getByRole('combobox', { name: 'Vista guardada' })).toHaveTextContent('Vistas guardadas');
  expect(screen.getByRole('list', { name: 'Filtros activos' })).toBeVisible();
  expect(screen.getByText('Filtros', { exact: true })).toBeVisible();
  expect(container.querySelector('[aria-live]')?.textContent).toBe('Encontrados: 1200');
  expect(resultCount).toHaveBeenCalledWith(1200);
  expect(removeFilter).toHaveBeenCalledWith('Status', 'Running');
  const remove = screen.getByRole('button', { name: 'Quitar Status|Running' });
  remove.focus();
  expect(remove).toHaveFocus();
  await user.keyboard('{Delete}');
  expect(screen.queryByRole('button', { name: 'Quitar Status|Running' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Añadir filtro' }));
  await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Failed' }));
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Quitar Status|Failed' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Borrar todo' }));
  expect(screen.queryByRole('list', { name: 'Filtros activos' })).toBeNull();
  await user.click(screen.getByRole('combobox', { name: 'Vista guardada' }));
  expect(await screen.findByRole('option', { name: 'Needs attention' })).toBeVisible();
});

it('retains legacy props, default markup and provider fallbacks for keys that are omitted', () => {
  const { container, rerender } = render(
    <I18nProvider locale="es">
      <FilterBar resultCount={1200} searchLabel="Find" placeholder="Type" />
    </I18nProvider>,
  );
  const original = container.querySelector('[aria-live]')?.outerHTML;
  const landmark = screen.getByRole('search').getAttribute('aria-label');
  rerender(
    <I18nProvider locale="es">
      <FilterBar
        resultCount={1200}
        searchLabel="Find"
        placeholder="Type"
        labels={{ clearAll: 'Clear', searchLabel: 'Override', searchPlaceholder: 'Override type' }}
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('searchbox', { name: 'Override' })).toHaveAttribute('placeholder', 'Override type');
  expect(screen.getByRole('search')).toHaveAttribute('aria-label', landmark);
  expect(container.querySelector('[aria-live]')?.outerHTML).toBe(original);
  expect(screen.getByRole('button', { name: 'Clear' })).toBeVisible();
});
