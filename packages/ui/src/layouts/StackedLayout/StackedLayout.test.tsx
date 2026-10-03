import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import StackedLayoutNarrow from './examples/StackedLayoutNarrow';
import StackedLayoutTabs from './examples/StackedLayoutTabs';
import StackedLayoutMegaMenu from './examples/StackedLayoutMegaMenu';

describe('StackedLayout', () => {
  it('renders the navbar links with the current page and the landmarks', () => {
    render(<StackedLayoutTabs />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'stacked-layout-main');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Acme Industries');
  });

  it('the skip link is the first Tab stop and moves focus to main', async () => {
    const user = userEvent.setup();
    render(<StackedLayoutNarrow />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('activating a desktop link updates the current page', async () => {
    const user = userEvent.setup();
    render(<StackedLayoutTabs />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('link', { name: 'Analytics' }));
    expect(within(nav).getByRole('link', { name: 'Analytics' })).toHaveAttribute('aria-current', 'page');
  });

  it('the sub-nav tabs switch the content', async () => {
    const user = userEvent.setup();
    render(<StackedLayoutTabs />);
    const tab = screen.getByRole('tab', { name: 'Archived' });
    await user.click(tab);
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('the mobile menu opens a drawer with the links; Escape closes it', async () => {
    const user = userEvent.setup();
    render(<StackedLayoutTabs />);
    const menu = screen.getByRole('button', { name: 'Open navigation' });
    menu.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Navigation' });
    expect(within(dialog).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(menu).toHaveFocus();
  });

  it('renders the nav slot in the top bar instead of the desktop links; Enter opens a MegaMenu panel', async () => {
    const user = userEvent.setup();
    render(<StackedLayoutMegaMenu />);
    const banner = screen.getByRole('banner');
    const nav = within(banner).getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '#overview');
    expect(within(banner).getAllByRole('navigation')).toHaveLength(1);
    const trigger = within(nav).getByRole('button', { name: 'Workspace' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    const { unmount } = render(<StackedLayoutTabs />);
    await expectNoAxeViolations();
    unmount();
    render(<StackedLayoutNarrow />);
    await expectNoAxeViolations();
  });

  it('nav slot example has no axe violations', async () => {
    render(<StackedLayoutMegaMenu />);
    await expectNoAxeViolations();
  });
});
