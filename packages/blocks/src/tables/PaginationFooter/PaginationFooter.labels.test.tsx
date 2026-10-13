import { I18nProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationFooter } from './PaginationFooter';

it('replaces the entire range announcement and nested pagination labels', async () => {
  const rangeSummary = vi.fn(() => 'Exact caller announcement');
  const page = vi.fn((n: number) => `Página ${n}`);
  const onPageChange = vi.fn();
  render(
    <I18nProvider locale="es" messages={{ 'table.rowsPerPage': 'Provider value' }}>
      <PaginationFooter
        labels={{
          rowsPerPage: 'Filas por página',
          rangeSummary,
          pagination: (noun) => `${noun} páginas`,
          previous: 'Anterior',
          next: 'Siguiente',
          page,
        }}
        noun="Items"
        onPageChange={onPageChange}
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Filas por página' })).toBeInTheDocument();
  expect(document.querySelector('[aria-live]')?.textContent).toBe('Exact caller announcement');
  expect(rangeSummary).toHaveBeenLastCalledWith(1, 10, 97);
  expect(screen.getByRole('navigation', { name: 'Items páginas' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(rangeSummary).toHaveBeenLastCalledWith(11, 20, 97);
  expect(onPageChange).toHaveBeenLastCalledWith(2);
  expect(page).toHaveBeenCalledWith(10);
});
