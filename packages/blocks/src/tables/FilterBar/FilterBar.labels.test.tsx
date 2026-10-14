import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

describe('FilterBar labels at the rendered block boundary', () => {
  it('keeps English result plurals until a caller supplies a verbatim formatter', () => {
    const { container, rerender } = render(<FilterBar resultCount={1} />);
    expect(container.querySelector('p[aria-live]')?.textContent).toBe('1 result');
    rerender(<FilterBar resultCount={1234} />);
    expect(container.querySelector('p[aria-live]')?.textContent).toBe('1,234 results');
    const results = vi.fn(() => '  <caller results>  ');
    rerender(<FilterBar resultCount={1234} labels={{ results }} />);
    expect(results).toHaveBeenLastCalledWith(1234);
    expect(container.querySelector('p[aria-live]')?.textContent).toBe('  <caller results>  ');
  });

  it('replaces search, saved views, chips and result announcements', async () => {
    const user = userEvent.setup();
    const remove = vi.fn((field: string, value: string) => `<${field}/${value}>`);
    const results = vi.fn((count: number) => `<${count} encontrados>`);
    render(
      <FilterBar
        fields={[{ id: 'state', label: 'State', options: ['Ready'] }]}
        defaultFilters={[]}
        views={[{ value: 'one', label: 'First', filters: [] }]}
        resultCount={1234}
        labels={{
          searchRegion: 'Búsqueda',
          searchLabel: 'Buscar',
          placeholder: 'Escriba…',
          savedViewLabel: 'Vista',
          savedViewPlaceholder: 'Elegir vista',
          addFilter: 'Añadir',
          filtersHeading: 'Filtros activos',
          activeFilters: 'Lista de filtros',
          remove,
          clearAll: 'Limpiar',
          results,
        }}
      />,
    );
    expect(screen.getByRole('search', { name: 'Búsqueda' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toHaveAttribute('placeholder', 'Escriba…');
    expect(screen.getByRole('combobox', { name: 'Vista' })).toHaveTextContent('Elegir vista');
    expect(results).toHaveBeenCalledWith(1234);
    expect(screen.getByText('<1234 encontrados>')).toHaveAttribute('aria-live', 'polite');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Ready' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0));
    expect(screen.getByText('Filtros activos')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Lista de filtros' })).toBeInTheDocument();
    expect(remove).toHaveBeenCalledWith('State', 'Ready');
    const chip = screen.getByRole('button', { name: '<State/Ready>' });
    chip.focus();
    expect(chip).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'x');
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('keeps legacy props ahead of labels and merges provider fallbacks', () => {
    render(
      <I18nProvider locale="es">
        <FilterBar
          searchLabel="Legacy name"
          placeholder="Legacy placeholder"
          resultCount={1234}
          labels={{ searchLabel: 'Ignored', placeholder: 'Ignored', clearAll: 'Custom clear' }}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole('searchbox', { name: 'Legacy name' })).toHaveAttribute('placeholder', 'Legacy placeholder');
    expect(screen.getByRole('button', { name: 'Añadir filtro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom clear' })).toBeInTheDocument();
    expect(screen.getByText('1,234')).toHaveClass('font-mono');
    expect(screen.getByText('results')).toBeInTheDocument();
  });
});
