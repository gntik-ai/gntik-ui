import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import RowReorderExample from './examples/row-reorder';

it('applies routing priority moves with a locked fallback and keeps filtering available', async () => {
  const user = userEvent.setup();
  render(<RowReorderExample />);
  const grip = screen.getByRole('button', { name: 'Reorder orders-api' });
  expect(screen.getByRole('button', { name: 'Reorder default-route' })).toBeDisabled();
  grip.focus();
  await user.keyboard(' {Home} ');
  expect(screen.getAllByRole('rowheader')[0]).toHaveTextContent('orders-api');
  expect(grip).toHaveFocus();
  await user.type(screen.getByRole('searchbox'), 'orders');
  const search = screen.getByRole('searchbox');
  await user.keyboard('{Enter}');
  expect(search).toHaveValue('orders');
  expect(screen.getByRole('button', { name: 'Reorder orders-api' })).toHaveAttribute('aria-disabled', 'true');
});

it.each(['dark', 'light', 'high_contrast'])('has no axe violations in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(<RowReorderExample />);
  await expectNoAxeViolations(container);
  const table = screen.getByRole('table');
  expect(within(table).getByRole('columnheader', { name: 'Reorder' })).toBeInTheDocument();
});
