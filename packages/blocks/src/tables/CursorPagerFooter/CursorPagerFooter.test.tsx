import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CursorPagerFooter } from './CursorPagerFooter';

describe('CursorPagerFooter', () => {
  it('renders meaningful no-props fixtures for the catalogue', () => {
    render(<CursorPagerFooter />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('25 records shown');
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('forwards navigation, count, labels, select, busy, summary and className props', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const props = {
      hasPrevious: false,
      hasNext: true,
      onPrevious: vi.fn(),
      onNext,
      shownCount: 25,
      total: 97,
      pageSize: 25,
      pageSizeOptions: [25, 50],
      onPageSizeChange: vi.fn(),
      unavailableBehaviour: 'hidden' as const,
      previousLabel: 'Back',
      nextLabel: 'Forward',
      ariaLabel: 'Records',
      labels: {
        shownSummary: (n: number) => `${n} shown`,
        totalSummary: (n: number) => `${n} exact`,
        rowsPerPage: 'Response size',
        rowsPerPageLabel: 'Choose size',
      },
      className: 'gap-4',
    };
    const { rerender } = render(<CursorPagerFooter {...props} />);
    expect(screen.getByRole('navigation', { name: 'Records' })).toHaveClass('gap-4');
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('97 exact');
    expect(screen.getByRole('combobox', { name: 'Choose size' })).toHaveTextContent('25');
    await user.click(screen.getByRole('button', { name: 'Forward' }));
    expect(onNext).toHaveBeenCalledExactlyOnceWith();
    rerender(<CursorPagerFooter {...props} loading loadingLabel="Fetching" />);
    expect(screen.getByRole('status')).toHaveTextContent('Fetching');
    expect(screen.getByRole('button', { name: 'Forward' })).toHaveAttribute('aria-busy', 'true');
    rerender(<CursorPagerFooter {...props} busy summary={null} loadingLabel={null} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
