import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import CursorStack from './examples/CursorStack';
import Busy from './examples/Busy';
import Hidden from './examples/Hidden';
import RowsPerPage from './examples/RowsPerPage';
import { CursorPagerFooter } from './CursorPagerFooter';

it('lets a consumer navigate its own opaque cursor stack without numbered table pagination', async () => {
  const user = userEvent.setup();
  render(<CursorStack />);
  expect(screen.getByRole('cell', { name: 'Record A' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('cell', { name: 'Record B' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('cell', { name: 'Record C' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute('aria-disabled', 'true');
  await user.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(screen.getByRole('cell', { name: 'Record B' })).toBeVisible();
  expect(screen.getAllByRole('navigation')).toHaveLength(1);
});

for (const theme of ['dark', 'light', 'high_contrast']) {
  it.each([CursorPagerFooter, CursorStack, Busy, Hidden, RowsPerPage])(
    `footer examples have no axe violations in ${theme}: %s`,
    async (Example) => {
      document.documentElement.className = theme;
      const { container } = render(<Example />);
      await expectNoAxeViolations(container);
    },
  );
}
