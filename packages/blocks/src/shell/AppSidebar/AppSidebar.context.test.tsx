import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuItem } from '@gntik-ai/ui';
import { createHash } from 'node:crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import { expectNoAxeViolations } from '../../test/a11y';
import { AppSidebar, AppSidebarFooter, AppSidebarHeader, AppSidebarNav } from './AppSidebar';

const tenants = [
  { id: 't1', name: 'One' },
  { id: 't2', name: 'Two' },
];

describe('AppSidebar context', () => {
  it('keeps the default header markup byte-identical to 0.11.0, including generated IDs', () => {
    // Captured from the assigned immutable base dbf5a248e551cace019a26c105a8d76f866b2647.
    const html = renderToStaticMarkup(<AppSidebarHeader />);
    expect(createHash('sha256').update(html).digest('hex')).toBe(
      '4aeef719ee282401ef33d640e7e4745d3bfbbb93e81b6e6e15ab2290fad2b2fc',
    );
  });
  it('forwards context, branding and menu content through the composite sidebar', async () => {
    const onTenantSelect = vi.fn();
    render(
      <AppSidebar
        tenants={tenants}
        currentTenantId="t1"
        onTenantSelect={onTenantSelect}
        tenantLabel="Organization"
        tenantEmptyText="No organizations"
        workspaceLabel="Spaces"
        workspaceEmptyText="No spaces"
        contextRegionLabel="Active context"
        contextBusy
        contextStatus={<span role="status">Syncing</span>}
        brand={<span>Console identity</span>}
        userMenuChildren={<MenuItem>Language</MenuItem>}
      />,
    );
    const region = screen.getByRole('region', { name: 'Active context' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(within(region).getByRole('status')).toHaveTextContent('Syncing');
    const tenant = within(region).getByRole('combobox', { name: 'Organization' });
    expect(tenant).toHaveTextContent('One');
    expect(within(region).getByRole('button', { name: /Spaces/ })).toBeInTheDocument();
    expect(screen.getByText('Console identity')).toBeInTheDocument();
    await userEvent.click(tenant);
    await userEvent.click(await screen.findByRole('option', { name: 'Two' }));
    expect(onTenantSelect).toHaveBeenCalledWith('t2');
    await userEvent.click(screen.getByRole('button', { name: /Dana Whitfield/ }));
    expect(within(await screen.findByRole('menu')).getByRole('menuitem', { name: 'Language' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
  it('adds footer menu children alongside items while allowing usage and help to be hidden', async () => {
    render(
      <AppSidebarFooter
        usage={null}
        helpHref=""
        userMenuItems={[{ label: 'Account' }]}
        userMenuChildren={<MenuItem>Language</MenuItem>}
      />,
    );
    expect(screen.queryByRole('meter')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Dana Whitfield/ }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Language' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Account' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
  it('replaces the logo with a brand in expanded, logo-only, hidden-context and rail headers', () => {
    const brand = <span>Console identity</span>;
    const { rerender } = render(<AppSidebarHeader brand={brand} />);
    expect(screen.getByText('Console identity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acme Industries/ })).toBeInTheDocument();
    for (const props of [
      { workspaces: null },
      { workspaces: [] },
      { hideWorkspaceContext: true },
      { collapsed: true },
    ]) {
      rerender(<AppSidebarHeader brand={brand} tenants={tenants} contextRegionLabel="Active context" {...props} />);
      expect(screen.getByText('Console identity')).toBeInTheDocument();
      expect(screen.queryByRole('img')).toBeNull();
    }
  });
  it('opts into a named busy region and hides context in platform-wide and collapsed modes', () => {
    const props = {
      tenants,
      contextRegionLabel: 'Active context',
      contextBusy: true,
      contextStatus: <span role="status">Updating context</span>,
    };
    const { container, rerender } = render(<AppSidebarHeader {...props} />);
    const region = screen.getByRole('region', { name: 'Active context' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(within(region).getByRole('combobox', { name: 'Tenant' })).toBeInTheDocument();
    expect(within(region).getByRole('button', { name: /Acme Industries/ })).toBeInTheDocument();
    expect(within(region).getByRole('status')).toHaveTextContent('Updating context');
    rerender(<AppSidebarHeader {...props} contextRegionLabel={undefined} />);
    expect(container.querySelector('section')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<AppSidebarHeader {...props} hideWorkspaceContext />);
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('img')).toBeInTheDocument();
    rerender(<AppSidebarHeader {...props} collapsed />);
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
  it('passes workspace headings and search empty copy without adding a create entry', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AppSidebarHeader workspaceLabel="Available spaces" />);
    await user.click(screen.getByRole('button', { name: /Acme Industries/ }));
    expect(await screen.findByRole('group', { name: 'Available spaces' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Create workspace' })).toBeNull();
    await user.keyboard('{Escape}');
    rerender(
      <AppSidebarHeader
        workspaceLabel="Available spaces"
        workspaceEmptyText="No matching spaces"
        workspaces={Array.from({ length: 7 }, (_, i) => ({ id: `w${i}`, name: `Space ${i}` }))}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: /Available spaces/ }));
    expect(await screen.findByRole('listbox', { name: 'Available spaces' })).toBeInTheDocument();
    await user.type(screen.getByRole('combobox', { name: 'Find a workspace' }), 'no match');
    expect(await screen.findByText('No matching spaces')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Create workspace' })).toBeNull();
  });
  it('omits tenants by default and shows the empty tenant text even without workspaces', () => {
    const { rerender } = render(<AppSidebarHeader />);
    expect(screen.queryByRole('combobox')).toBeNull();
    rerender(
      <AppSidebarHeader tenants={[]} tenantLabel="Organization" tenantEmptyText="No organizations" workspaces={null} />,
    );
    expect(screen.getByRole('combobox', { name: 'Organization' })).toHaveTextContent('No organizations');
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
  it('selects and clears a tenant before workspace and navigation in keyboard order', async () => {
    const user = userEvent.setup();
    const onTenantSelect = vi.fn();
    const { container } = render(
      <>
        <AppSidebarHeader tenants={tenants} currentTenantId="t1" tenantLabel="Tenant" onTenantSelect={onTenantSelect} />
        <AppSidebarNav />
      </>,
    );
    const tenant = screen.getByRole('combobox', { name: 'Tenant' });
    expect(tenant).toHaveTextContent('One');
    expect(container.querySelector('section')).toBeNull();
    await user.tab();
    expect(tenant).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Clear Tenant' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /Acme Industries/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveFocus();
    await user.click(tenant);
    await screen.findByRole('listbox', { name: 'Tenant' });
    await expectNoAxeViolations();
    await user.click(await screen.findByRole('option', { name: 'Two' }));
    expect(onTenantSelect).toHaveBeenCalledWith('t2');
    await user.click(tenant);
    await user.keyboard('{Escape}');
    tenant.focus();
    await user.keyboard('{Delete}');
    expect(onTenantSelect).toHaveBeenLastCalledWith(null);
  });
});
