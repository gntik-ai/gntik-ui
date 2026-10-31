import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster } from '@gntik-ai/ui';

describe('Sidebar shell examples', () => {
  it('demonstrates the brand slot in the sidebar, rail and mobile topbar', async () => {
    const { default: Brand } = await import('./examples/Brand');
    render(<Brand />);
    expect(within(screen.getByRole('complementary')).getByText('Console identity')).toBeInTheDocument();
    expect(within(screen.getAllByRole('banner')[0]!).getByText('Console identity').parentElement).toHaveClass(
      'lg:hidden',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(within(screen.getByRole('complementary')).getByText('Console identity')).toBeInTheDocument();
  });
  it('demonstrates language choices alongside standard account actions', async () => {
    const { default: UserMenuChildren } = await import('./examples/UserMenuChildren');
    render(<UserMenuChildren />);
    const sidebar = screen.getByRole('complementary');
    await userEvent.click(within(sidebar).getByRole('button', { name: /Dana Whitfield/ }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Account settings' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitemradio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'French' }));
    await userEvent.click(within(sidebar).getByRole('button', { name: /Dana Whitfield/ }));
    expect(within(await screen.findByRole('menu')).getByRole('menuitemradio', { name: 'French' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.queryByRole('meter')).toBeNull();
    expect(within(sidebar).queryByRole('link', { name: 'Help & docs' })).toBeNull();
  });
  it('demonstrates a busy context region whose consumer resets it', async () => {
    const { default: ContextRegion } = await import('./examples/ContextRegion');
    render(<ContextRegion />);
    const region = screen.getByRole('region', { name: 'Active context' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Updating context');
    await userEvent.click(screen.getByRole('button', { name: 'Finish context update' }));
    expect(region).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Context ready');
  });
  it('demonstrates platform-wide context with a brand and no context controls', async () => {
    const { default: PlatformWide } = await import('./examples/PlatformWide');
    render(
      <ToastProvider>
        <PlatformWide />
        <Toaster />
      </ToastProvider>,
    );
    expect(screen.getAllByText('Platform console').length).toBeGreaterThan(0);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(within(screen.getByRole('complementary')).queryByRole('region')).toBeNull();
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
  });
  it('demonstrates tenant selection, clearing and custom workspace copy', async () => {
    const { default: Tenants } = await import('./examples/Tenants');
    render(<Tenants />);
    const user = userEvent.setup();
    const tenant = screen.getByRole('combobox', { name: 'Organization' });
    expect(tenant).toHaveTextContent('One');
    await user.click(tenant);
    await user.click(await screen.findByRole('option', { name: 'Two' }));
    expect(tenant).toHaveTextContent('Two');
    tenant.focus();
    await user.keyboard('{Delete}');
    expect(tenant).toHaveTextContent('Select tenant');
    expect(screen.getByRole('combobox', { name: /Team spaces/ })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Platform context');
    await user.click(screen.getByRole('button', { name: 'Show empty tenant list' }));
    expect(tenant).toHaveTextContent('No organizations');
  });
});
