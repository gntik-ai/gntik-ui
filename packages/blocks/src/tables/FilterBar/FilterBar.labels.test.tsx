import { I18nProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

it('replaces search, saved views, menu, chips and the whole count announcement', async () => {
  const user = userEvent.setup();
  const resultCount = vi.fn(() => 'Caller plural');
  const removeFilter = vi.fn((field: string, value: string) => `Quitar ${field}/${value}`);
  const labels = {
    search: 'Buscar aquí',
    placeholder: 'Escribe aquí',
    region: 'Consulta',
    savedView: 'Vista elegida',
    savedViews: 'Elige vista',
    addFilter: 'Añadir condición',
    activeFilters: 'Condiciones activas',
    filters: 'Condiciones',
    clearAll: 'Vaciar',
    resultCount,
    removeFilter,
  };
  const { rerender } = render(
    <I18nProvider locale="es">
      <FilterBar labels={labels} resultCount={1} />
    </I18nProvider>,
  );
  expect(screen.getByRole('search', { name: labels.region })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: labels.search })).toHaveAttribute('placeholder', labels.placeholder);
  expect(screen.getByRole('combobox', { name: labels.savedView })).toHaveTextContent(labels.savedViews);
  expect(screen.getByRole('list', { name: labels.activeFilters })).toBeInTheDocument();
  expect(screen.getByText(labels.filters)).toBeInTheDocument();
  expect(document.querySelector('[aria-live]')?.textContent).toBe('Caller plural');
  expect(resultCount).toHaveBeenLastCalledWith(1);
  expect(removeFilter).toHaveBeenCalledWith('Status', 'Running');
  await user.click(screen.getByRole('button', { name: labels.addFilter }));
  await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Failed' }));
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Quitar Status/Failed' }));
  await user.click(screen.getByRole('button', { name: labels.clearAll }));
  expect(screen.queryByRole('list')).toBeNull();
  rerender(<FilterBar labels={{ resultCount }} resultCount={1234} />);
  expect(resultCount).toHaveBeenLastCalledWith(1234);
});
