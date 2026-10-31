import { MenuItem } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createHash } from 'node:crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConsoleShell } from './ConsoleShell';

const tenants = [
  { id: 't1', name: 'One' },
  { id: 't2', name: 'Two' },
];

describe('ConsoleShell context', () => {
  it('keeps default shell markup byte-identical to 0.11.0, including generated IDs', () => {
    // Captured with the original shell and sidebar from base dbf5a248e551cace019a26c105a8d76f866b2647.
    const html = renderToStaticMarkup(<ConsoleShell>Content</ConsoleShell>);
    expect(createHash('sha256').update(html).digest('hex')).toBe(
      '096157f995d4136849fadc68b67ab79e189a43554e684366a9876d963a1b639c',
    );
  });
  it('keeps context out of the rail and renders expanded context and portalled menu extras in the drawer', async () => {
    const user = userEvent.setup();
    render(
      <ConsoleShell
        tenants={tenants}
        currentTenantId="t1"
        contextRegionLabel="Active context"
        brand={<span>Console identity</span>}
        userMenuChildren={<MenuItem>Language</MenuItem>}
      >
        Content
      </ConsoleShell>,
    );
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).queryByRole('combobox')).toBeNull();
    expect(within(sidebar).queryByRole('region')).toBeNull();
    expect(within(sidebar).getByText('Console identity')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog', { name: 'Sidebar' });
    const region = within(drawer).getByRole('region', { name: 'Active context' });
    expect(within(region).getByRole('combobox', { name: 'Tenant' })).toHaveTextContent('One');
    expect(within(region).getByRole('button', { name: /Acme Industries/ })).toBeInTheDocument();
    expect(within(drawer).getByText('Console identity')).toBeInTheDocument();
    await user.click(within(drawer).getByRole('button', { name: /Dana Whitfield/ }));
    expect(within(await screen.findByRole('menu')).getByRole('menuitem', { name: 'Language' })).toBeInTheDocument();
  });
  it('forwards optional context and footer props and adds mobile branding only when supplied', async () => {
    const user = userEvent.setup();
    const onTenantSelect = vi.fn();
    const { rerender } = render(<ConsoleShell>Content</ConsoleShell>);
    const topbar = screen.getByRole('banner');
    const defaultNodes = topbar.lastElementChild!.childElementCount;
    expect(screen.queryByRole('combobox', { name: 'Organization' })).toBeNull();
    rerender(
      <ConsoleShell
        tenants={tenants}
        currentTenantId="t1"
        onTenantSelect={onTenantSelect}
        tenantLabel="Organization"
        tenantEmptyText="No organizations"
        workspaceLabel="Spaces"
        workspaceEmptyText="No spaces"
        contextRegionLabel="Active context"
        contextBusy
        contextStatus={<span role="status">Updating</span>}
        brand={<span>Console identity</span>}
        userMenuChildren={<MenuItem>Language</MenuItem>}
        usage={null}
        helpHref=""
      >
        Content
      </ConsoleShell>,
    );
    const sidebar = screen.getByRole('complementary');
    const region = within(sidebar).getByRole('region', { name: 'Active context' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(within(region).getByRole('status')).toHaveTextContent('Updating');
    const tenant = within(region).getByRole('combobox', { name: 'Organization' });
    expect(tenant).toHaveTextContent('One');
    expect(within(region).getByRole('button', { name: /Spaces/ })).toBeInTheDocument();
    const mobileBrand = within(topbar).getByText('Console identity').parentElement;
    expect(mobileBrand).toHaveClass('lg:hidden', 'min-w-0', 'shrink-0');
    expect(topbar.lastElementChild!.childElementCount).toBe(defaultNodes + 1);
    expect(screen.queryByRole('meter')).toBeNull();
    expect(within(sidebar).queryByRole('link', { name: 'Help & docs' })).toBeNull();
    await user.click(tenant);
    await user.click(await screen.findByRole('option', { name: 'Two' }));
    expect(onTenantSelect).toHaveBeenCalledWith('t2');
    await user.click(within(sidebar).getByRole('button', { name: /Dana Whitfield/ }));
    expect(within(await screen.findByRole('menu')).getByRole('menuitem', { name: 'Language' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    rerender(
      <ConsoleShell tenants={[]} tenantEmptyText="No organizations" brand={<span>Console identity</span>}>
        Content
      </ConsoleShell>,
    );
    expect(screen.getByRole('combobox', { name: 'Tenant' })).toHaveTextContent('No organizations');
    rerender(
      <ConsoleShell
        tenants={tenants}
        hideWorkspaceContext
        contextRegionLabel="Active context"
        brand={<span>Console identity</span>}
      >
        Content
      </ConsoleShell>,
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(within(sidebar).getByText('Console identity')).toBeInTheDocument();
    rerender(<ConsoleShell>Content</ConsoleShell>);
    expect(topbar.lastElementChild!.childElementCount).toBe(defaultNodes);
  });
});
