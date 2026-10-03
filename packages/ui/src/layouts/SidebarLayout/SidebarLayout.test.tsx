import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SidebarLayout } from './SidebarLayout';
import SidebarLayoutApp from './examples/SidebarLayoutApp';
import SidebarLayoutOffcanvas from './examples/SidebarLayoutOffcanvas';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {}
});

describe('SidebarLayout', () => {
  it('renders the landmarks: sidebar, banner, main', () => {
    render(<SidebarLayoutApp />);
    expect(screen.getByRole('complementary', { name: 'Sidebar' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'sidebar-layout-main');
  });

  it('the skip link is the first Tab stop and moves focus to main', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('Enter / Space on the collapse toggle switch the icon rail and persist it', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    toggle.focus();
    await user.keyboard('{Enter}');
    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('complementary')).toHaveAttribute('data-state', 'rail');
    expect(localStorage.getItem('example-sidebar-collapsed')).toBe('true');
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('restores the persisted collapsed state', () => {
    localStorage.setItem('example-sidebar-collapsed', 'true');
    render(<SidebarLayoutApp />);
    expect(screen.getByRole('complementary')).toHaveAttribute('data-state', 'rail');
  });

  it('off-canvas mode hides the sidebar (inert) when collapsed', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutOffcanvas />);
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('complementary', { hidden: true })).toHaveAttribute('data-state', 'offcanvas');
  });

  it('the menu button opens the drawer; Escape closes it and returns focus', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    const menu = screen.getByRole('button', { name: 'Open navigation' });
    menu.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Sidebar' });
    expect(within(dialog).getByRole('navigation', { name: 'Workspace' })).toBeInTheDocument();
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(menu).toHaveFocus();
  });

  it('navigating inside the drawer closes it', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sidebar' });
    await user.click(within(dialog).getByRole('link', { name: 'Billing' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: 'Billing' })).toBeInTheDocument();
  });

  it('fullScreen uses the viewport height', () => {
    const { container } = render(<SidebarLayout fullScreen sidebar={null} />);
    expect(container.firstElementChild).toHaveClass('h-dvh');
  });

  it('examples have no axe violations (closed and with the drawer open)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SidebarLayoutOffcanvas />);
    await expectNoAxeViolations();
    unmount();
    render(<SidebarLayoutApp />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
