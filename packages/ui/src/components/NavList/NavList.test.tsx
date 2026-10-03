import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Rocket, Settings } from 'lucide-react';
import { expectNoAxeViolations } from '../../test/a11y';
import NavListSettings from './examples/NavListSettings';
import NavListSidebar from './examples/NavListSidebar';
import { NavList, type NavGroup } from './NavList';

const GROUPS: NavGroup[] = [
  {
    label: 'Main',
    collapsible: true,
    items: [
      { label: 'Home', href: '/home', icon: Home },
      { label: 'Deployments', href: '/deployments', icon: Rocket, badge: 3 },
    ],
  },
  { label: 'Admin', items: [{ label: 'Settings', icon: Settings, items: [{ label: 'General', href: '/settings/general' }, { label: 'Billing', href: '/settings/billing' }] }] },
];

describe('NavList', () => {
  it('renders a labelled nav with grouped lists and aria-current="page"', () => {
    render(<NavList groups={GROUPS} currentHref="/deployments" label="Primary" />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('list', { name: 'Main' })).toBeInTheDocument();
    const current = within(nav).getByRole('link', { name: 'Deployments 3' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('Tab moves through items and toggles in order', async () => {
    const user = userEvent.setup();
    render(<NavList groups={GROUPS} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Main' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Deployments 3' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
  });

  it('Enter follows a link through the LinkProvider router link', async () => {
    const user = userEvent.setup();
    render(<NavListSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Workspace' });
    const overview = within(nav).getByRole('link', { name: 'Overview' });
    expect(overview).toHaveAttribute('data-router-link');
    overview.focus();
    await user.keyboard('{Enter}');
    expect(overview).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Projects 12' })).not.toHaveAttribute('aria-current');
  });

  it('Enter / Space on a group heading folds and unfolds it', async () => {
    const user = userEvent.setup();
    render(<NavList groups={GROUPS} />);
    const toggle = screen.getByRole('button', { name: 'Main' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument());
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('nested sections open with Enter / Space and start open around the current page', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<NavList groups={GROUPS} />);
    const section = screen.getByRole('button', { name: 'Settings' });
    expect(section).toHaveAttribute('aria-expanded', 'false');
    section.focus();
    await user.keyboard(' ');
    expect(section).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Billing' })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(section).toHaveAttribute('aria-expanded', 'false');
    unmount();
    render(<NavList groups={GROUPS} currentHref="/settings/billing" />);
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute('aria-current', 'page');
  });

  it('collapsed rail hides labels, names items (with badge) and shows a tooltip on focus', async () => {
    const user = userEvent.setup();
    render(<NavList groups={GROUPS} collapsed />);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Deployments (3)' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Home');
  });

  it('collapsed rail opens nested sections as a flyout menu', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NavList groups={GROUPS} collapsed onNavigate={onNavigate} currentHref="/settings/general" />);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'General' })).toHaveAttribute('aria-current', 'page');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('the sidebar example toggles the rail', async () => {
    const user = userEvent.setup();
    render(<NavListSidebar />);
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('link', { name: 'Projects (12)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('button items run onClick and disabled items are skipped', async () => {
    const user = userEvent.setup();
    render(<NavListSettings />);
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(nav).getByRole('button', { name: 'Members' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(nav).getByRole('button', { name: 'Security' }));
    expect(within(nav).getByRole('button', { name: 'Security' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Integrations' })).toBeDisabled();
  });

  it('examples have no axe violations (expanded and rail)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <NavListSidebar />
        <NavListSettings />
      </>,
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    await expectNoAxeViolations();
  });
});
