import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { PaginationFooter, type PaginationFooterLabels } from './PaginationFooter';

it('replaces pagination chrome and renders formatter results verbatim through page and size changes', async () => {
  const user = userEvent.setup();
  const rangeSummary = vi.fn((from: number, to: number, total: number) => `${from}|${to}|${total} registros`);
  const paginationNav = vi.fn((noun: string) => `Paginación: ${noun}`);
  const page = vi.fn((n: number) => `Página ${n}`);
  const labels: PaginationFooterLabels = {
    rowsPerPage: 'Filas por página',
    rowsPerPageLabel: 'Tamaño de página',
    rangeSummary,
    paginationNav,
    previous: 'Anterior',
    next: 'Siguiente',
    page,
  };
  const { container } = render(<PaginationFooter labels={labels} noun="Items" />);
  expect(screen.getByText('Filas por página')).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'Paginación: Items' })).toBeVisible();
  expect(paginationNav).toHaveBeenCalledWith('Items');
  expect(page).toHaveBeenCalledWith(10);
  const summary = container.querySelector('[aria-live]');
  expect(summary?.textContent).toBe('1|10|97 registros');
  expect(rangeSummary).toHaveBeenLastCalledWith(1, 10, 97);
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(summary?.textContent).toBe('11|20|97 registros');
  expect(rangeSummary).toHaveBeenLastCalledWith(11, 20, 97);
  await user.click(screen.getByRole('button', { name: 'Anterior' }));
  await user.click(screen.getByRole('button', { name: 'Página 3' }));
  expect(summary?.textContent).toBe('21|30|97 registros');
  await user.click(screen.getByRole('combobox', { name: 'Tamaño de página' }));
  await user.click(await screen.findByRole('option', { name: '25' }));
  expect(summary?.textContent).toBe('1|25|97 registros');
  expect(rangeSummary).toHaveBeenLastCalledWith(1, 25, 97);
});

it('merges individual overrides over provider translations and preserves default summary markup', () => {
  const { container, rerender } = render(
    <I18nProvider locale="es">
      <PaginationFooter />
    </I18nProvider>,
  );
  const original = container.querySelector('[aria-live]')?.outerHTML;
  const nextName = screen.getAllByRole('button').at(-1)?.getAttribute('aria-label');
  rerender(
    <I18nProvider locale="es">
      <PaginationFooter labels={{ rowsPerPage: 'Custom' }} />
    </I18nProvider>,
  );
  expect(screen.getByText('Custom')).toBeVisible();
  expect(container.querySelector('[aria-live]')?.outerHTML).toBe(original);
  expect(screen.getAllByRole('button').at(-1)?.getAttribute('aria-label')).toBe(nextName);
  expect(screen.getByRole('combobox')).not.toHaveAccessibleName('Custom');
});
