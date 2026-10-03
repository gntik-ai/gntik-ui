import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import UserMenuAccount from './examples/UserMenuAccount';
import UserMenuWithName from './examples/UserMenuWithName';

async function openMenu(key = '{Enter}') {
  const user = userEvent.setup();
  render(<UserMenuAccount />);
  const trigger = screen.getByRole('button', { name: 'Account menu for Dana Whitfield' });
  await user.tab();
  expect(trigger).toHaveFocus();
  await user.keyboard(key);
  const menu = await screen.findByRole('menu');
  return { user, trigger, menu };
}

describe('UserMenu', () => {
  it.each([['{Enter}'], [' '], ['{ArrowDown}']])('opens with %s and shows the name/email header', async (key) => {
    const { menu } = await openMenu(key);
    expect(within(menu).getByText('Dana Whitfield')).toBeInTheDocument();
    expect(within(menu).getByText('dana@example.com')).toBeInTheDocument();
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Profile/ })).toHaveFocus());
  });

  it('arrow keys move between items and Enter runs one and closes', async () => {
    const { user, trigger, menu } = await openMenu();
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Profile/ })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Settings/ })).toHaveFocus());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByText('Settings', { selector: 'p' })).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('links render as anchors', async () => {
    const { menu } = await openMenu();
    expect(within(menu).getByRole('menuitem', { name: 'Billing' })).toHaveAttribute('href', '#billing');
  });

  it('the Theme submenu opens with ArrowRight and selects a mode', async () => {
    const { user, menu } = await openMenu();
    const theme = within(menu).getByRole('menuitem', { name: 'Theme' });
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Profile/ })).toHaveFocus());
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(theme).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: 'High contrast' }));
    expect(document.documentElement).toHaveClass('high_contrast');
  });

  it('Sign out is destructive and Escape returns focus to the avatar', async () => {
    const { user, trigger, menu } = await openMenu();
    expect(within(menu).getByRole('menuitem', { name: 'Sign out' })).toHaveClass('text-destructive-text');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('can show the name in the trigger', () => {
    render(<UserMenuWithName />);
    expect(screen.getByRole('button', { name: 'Account menu for Sam Patel' })).toHaveTextContent('Sam Patel');
  });

  it('open menus have no axe violations', async () => {
    const { user } = await openMenu();
    await expectNoAxeViolations();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Theme' })).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await expectNoAxeViolations();
  });
});
