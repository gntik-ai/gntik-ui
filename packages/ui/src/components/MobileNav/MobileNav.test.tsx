import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import MobileNavBasic from './examples/MobileNavBasic';

async function openSheet() {
  const user = userEvent.setup();
  render(<MobileNavBasic />);
  const trigger = screen.getByRole('button', { name: 'Open navigation' });
  await user.tab();
  expect(trigger).toHaveFocus();
  await user.keyboard('{Enter}');
  const dialog = await screen.findByRole('dialog', { name: 'Acme Cloud' });
  return { user, trigger, dialog };
}

describe('MobileNav', () => {
  it('Enter on the menu button opens the sheet with the navigation and moves focus inside', async () => {
    const { dialog } = await openSheet();
    const nav = within(dialog).getByRole('navigation', { name: 'Navigation' });
    expect(within(nav).getByRole('link', { name: 'Projects 12' })).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('Escape closes the sheet and returns focus to the menu button', async () => {
    const { user, trigger } = await openSheet();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('activating an item navigates and closes the sheet', async () => {
    const { user, dialog } = await openSheet();
    const billing = within(dialog).getByRole('link', { name: 'Billing' });
    billing.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('billing')).toBeInTheDocument();
  });

  it('open sheet has no axe violations', async () => {
    await openSheet();
    await expectNoAxeViolations();
  });
});
