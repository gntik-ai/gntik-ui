import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { PaginationFooter } from './PaginationFooter';

it('audits every pagination label in Spanish and preserves an explicit noun', () => {
  const { container, rerender } = render(
    <I18nProvider locale="es">
      <PaginationFooter total={20} />
    </I18nProvider>,
  );
  expect(screen.getByText(es['table.rowsPerPage'])).toBeVisible();
  expect(screen.getByRole('combobox', { name: es['table.rowsPerPage'] })).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'Paginación: Filas' })).toBeVisible();
  expect(screen.getByRole('button', { name: es['pagination.previous'] })).toBeVisible();
  expect(screen.getByRole('button', { name: es['pagination.next'] })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Página 1' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Página 2' })).toBeVisible();
  expect(container.querySelector('[aria-live]')?.textContent).toBe('1–10 de 20');
  expect(container.textContent).not.toContain('{');
  rerender(
    <I18nProvider locale="es">
      <PaginationFooter noun="Caller rows" />
    </I18nProvider>,
  );
  expect(screen.getByRole('navigation', { name: 'Paginación: Caller rows' })).toBeVisible();
});
