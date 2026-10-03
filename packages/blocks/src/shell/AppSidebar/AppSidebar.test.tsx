import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AppSidebar } from './AppSidebar';

describe('AppSidebar', () => {
  it('renders the workspace switcher, navigation, usage, help and user', async () => {
    const { container } = render(<AppSidebar />);
    expect(screen.getByRole('button', { name: /Acme Industries/ })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Projects 12' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('meter', { name: 'Monthly requests' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Help & docs' })).toBeInTheDocument();
    expect(screen.getByText('Dana Whitfield')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  }, 15_000);

  it('switches workspace and reports navigation', async () => {
    const user = userEvent.setup();
    const onWorkspaceChange = vi.fn();
    const onNavigate = vi.fn();
    render(<AppSidebar onWorkspaceChange={onWorkspaceChange} onNavigate={onNavigate} />);
    await user.click(screen.getByRole('button', { name: /Acme Industries/ }));
    await user.click(await screen.findByRole('menuitemradio', { name: /Northbeam Labs/ }));
    expect(onWorkspaceChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'northbeam' }));
    expect(screen.getByRole('button', { name: /Northbeam Labs/ })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Billing' }));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ href: '/billing' }));
  });

  it('collapsed: icon rail with the brand mark and an icon-only help link', async () => {
    const { container } = render(<AppSidebar collapsed />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Help & docs' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveAttribute('data-collapsed');
    await expectNoAxeViolations(container);
  });
});
