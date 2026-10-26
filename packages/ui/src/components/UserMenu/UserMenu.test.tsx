import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import UserMenuAccount from './examples/UserMenuAccount';
import UserMenuWithName from './examples/UserMenuWithName';
import { UserMenu } from './UserMenu';
import UserMenuSidebarFooter from './examples/UserMenuSidebarFooter';
import { I18nProvider } from '../../i18n/I18nProvider';

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
  it('the sidebar footer truncates a long email and collapses to an avatar-only rail', async () => {
    const user = userEvent.setup();
    render(<UserMenuSidebarFooter />);
    const trigger = screen.getByRole('button', { name: 'Account menu for Ana López' });
    expect(trigger).toHaveClass('w-full');
    const email = within(trigger).getByText(
      'ana.lopez.with.a.very.long.account.address.for.sidebar.truncation@example.test',
    );
    expect(email).toHaveClass('truncate');
    expect(email.parentElement).toHaveClass('min-w-0', 'flex-col');
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(trigger).not.toHaveClass('w-full');
    expect(trigger).not.toHaveTextContent('Ana López');
    expect(trigger.querySelector('svg')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(
      within(trigger).getByText('ana.lopez.with.a.very.long.account.address.for.sidebar.truncation@example.test'),
    ).toBeInTheDocument();
  });

  it('shows a full-width two-line account trigger with a decorative trailing chevron', () => {
    render(<UserMenu showEmail user={{ name: 'Ana López', email: 'ana@example.test' }} />);
    const trigger = screen.getByRole('button', { name: 'Account menu for Ana López' });
    const name = within(trigger).getByText('Ana López');
    const email = within(trigger).getByText('ana@example.test');
    expect(trigger).toHaveClass('w-full', 'min-w-0', 'justify-start');
    expect(name).toHaveClass('truncate');
    expect(email).toHaveClass('truncate', 'font-mono', 'text-muted-foreground');
    expect(name.parentElement).toBe(email.parentElement);
    expect(email.parentElement).toHaveClass('flex', 'flex-col', 'min-w-0');
    const chevron = trigger.querySelector('svg');
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(trigger.lastElementChild).toBe(chevron);
  });

  it('omits the email line when the account has no email, even with showName false', () => {
    render(<UserMenu showEmail showName={false} user={{ name: 'Ana López' }} />);
    const trigger = screen.getByRole('button', { name: 'Account menu for Ana López' });
    const name = within(trigger).getByText('Ana López');
    expect(name.parentElement?.children).toHaveLength(1);
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['en', 'Account menu for Ana López'],
    ['es', 'Menú de la cuenta de Ana López'],
  ])('keeps the catalog account label in %s and honors triggerLabel', (locale, label) => {
    const { rerender } = render(
      <I18nProvider locale={locale}>
        <UserMenu showEmail user={{ name: 'Ana López', email: 'ana@example.test' }} />
      </I18nProvider>,
    );
    const trigger = screen.getByRole('button', { name: label });
    expect(trigger).not.toHaveAttribute('aria-describedby');
    rerender(
      <I18nProvider locale={locale}>
        <UserMenu showEmail triggerLabel="Ana López account" user={{ name: 'Ana López', email: 'ana@example.test' }} />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Ana López account' })).toBe(trigger);
  });

  it.each([
    [UserMenuAccount, 'Dana Whitfield', 'dana@example.com', false],
    [UserMenuWithName, 'Sam Patel', 'sam@example.com', true],
  ] as const)('preserves the legacy trigger for %s', (Example, name, email, showName) => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: `Account menu for ${name}` });
    expect(trigger).not.toHaveClass('w-full');
    expect(trigger.querySelector('svg')).toBeNull();
    expect(within(trigger).queryByText(email)).not.toBeInTheDocument();
    expect(trigger.children).toHaveLength(showName ? 2 : 1);
    expect(trigger.className).toBe(
      'inline-flex shrink-0 cursor-interactive items-center gap-2 rounded-lg transition-colors outline-none ' +
        'focus-ring ' +
        'data-popup-open:ring-2 data-popup-open:ring-ring/40' +
        (showName ? ' h-9 pe-2 ps-0.5 hover:bg-secondary/60' : ''),
    );
    if (showName) {
      expect(trigger.lastElementChild).toHaveClass('pe-1 text-[13px] font-semibold text-foreground', { exact: true });
      expect(trigger.lastElementChild).toHaveTextContent(name);
    }
  });

  it.each(['{Enter}', ' ', '{ArrowDown}'])(
    'opens the two-line trigger with %s and restores focus on Escape',
    async (key) => {
      const user = userEvent.setup();
      render(<UserMenuSidebarFooter />);
      const trigger = screen.getByRole('button', { name: 'Account menu for Ana López' });
      trigger.focus();
      await user.keyboard(key);
      const menu = await screen.findByRole('menu');
      await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Theme' })).toHaveFocus());
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    },
  );

  it.each(['dark', 'light', 'high_contrast'])(
    'the sidebar example has no axe violations closed and open in %s',
    async (theme) => {
      const previousTheme = document.documentElement.className;
      try {
        document.documentElement.className = theme === 'light' ? '' : theme;
        const user = userEvent.setup();
        render(<UserMenuSidebarFooter />);
        await expectNoAxeViolations();
        await user.click(screen.getByRole('button', { name: 'Account menu for Ana López' }));
        await screen.findByRole('menu');
        await expectNoAxeViolations();
      } finally {
        document.documentElement.className = previousTheme;
      }
    },
  );

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
