import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationFooter } from './PaginationFooter';

describe('PaginationFooter labels at the rendered block boundary', () => {
  it('renders formatter output verbatim through page and size changes', async () => {
    const user = userEvent.setup();
    const range = vi.fn((from: number, to: number, total: number) => `<${from}/${to}/${total}>`);
    const page = vi.fn((n: number) => `Ir ${n}`);
    render(
      <PaginationFooter
        total={97}
        labels={{
          rowsPerPage: 'Filas',
          rowsPerPageLabel: 'Cantidad',
          range,
          nav: 'Páginas',
          previous: 'Anterior',
          next: 'Siguiente',
          page,
        }}
      />,
    );
    expect(screen.getByText('Filas')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Páginas' })).toBeInTheDocument();
    expect(screen.getByText('<1/10/97>')).toHaveAttribute('aria-live', 'polite');
    expect(range).toHaveBeenLastCalledWith(1, 10, 97);
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('<11/20/97>')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    await user.click(screen.getByRole('button', { name: 'Ir 3' }));
    expect(range).toHaveBeenLastCalledWith(21, 30, 97);
    expect(page).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole('combobox', { name: 'Cantidad' }));
    await user.click(await screen.findByRole('option', { name: '25' }));
    await waitFor(() => expect(screen.queryAllByRole('listbox')).toHaveLength(0));
    expect(screen.getByText('<1/25/97>')).toBeInTheDocument();
  });

  it('merges a partial object over the existing provider and English defaults', () => {
    render(
      <I18nProvider locale="es">
        <PaginationFooter labels={{ next: 'Custom next' }} />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Custom next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filas por página' })).toBeInTheDocument();
    expect(screen.getByText('1–10')).toHaveClass('font-mono');
  });
});
