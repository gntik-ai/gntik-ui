import { fireEvent, render, screen } from '@testing-library/react';
import { PaginationFooter } from './PaginationFooter';

it('can hide the size control while retaining the summary and navigation', () => {
  const { rerender } = render(<PaginationFooter total={95} defaultPage={2} showPageSize={false} />);
  expect(screen.queryByText('Rows per page')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getByText('11–20').parentElement).toHaveTextContent('11–20 of 95');
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('21–30')).toBeInTheDocument();
  rerender(<PaginationFooter total={95} defaultPage={2} />);
  expect(screen.getByText('Rows per page')).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument();
});
