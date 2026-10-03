import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PaginationFooter } from './PaginationFooter';

describe('PaginationFooter', () => {
  it('renders the summary and pagination', async () => {
    const { container } = render(<PaginationFooter />);
    expect(screen.getByText('1–10')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Rows pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('pages and changes the page size', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(<PaginationFooter onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('11–20')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '25' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(screen.getByText('1–25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
  });
});
