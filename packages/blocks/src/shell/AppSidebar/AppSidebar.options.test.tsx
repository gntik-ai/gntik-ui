import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AppSidebar, AppSidebarFooter, AppSidebarHeader } from './AppSidebar';

it('forwards the navigation name through the composite sidebar', () => {
  render(<AppSidebar navLabel="Navegación principal" />);
  expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
});

describe.each([AppSidebarFooter, AppSidebar])('sidebar footer theme control (%s)', (Sidebar) => {
  it.each([undefined, true, false])('shows theme unless explicitly disabled (%s)', async (showTheme) => {
    render(<Sidebar userMenuShowTheme={showTheme} />);
    await userEvent.click(screen.getByRole('button', { name: /Dana Whitfield/ }));
    const theme = within(await screen.findByRole('menu')).queryByRole('menuitem', { name: 'Theme' });
    if (showTheme === false) expect(theme).toBeNull();
    else expect(theme).toBeInTheDocument();
  });
});

describe('sidebar empty workspaces', () => {
  it.each([undefined, 'Team spaces'])('opts into a labelled empty workspace menu (%s)', async (workspaceLabel) => {
    const user = userEvent.setup();
    const onCreateWorkspace = vi.fn();
    const { rerender } = render(
      <AppSidebarHeader workspaces={[]} workspaceLabel={workspaceLabel} workspaceEmptyText="No team spaces yet" />,
    );
    expect(screen.queryByRole('img')).toBeNull();
    const trigger = screen.getByRole('button', { name: workspaceLabel ?? 'Switch workspace' });
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('No team spaces yet')).toBeInTheDocument();
    expect(within(menu).queryByRole('menuitem', { name: 'Create workspace' })).toBeNull();
    await expectNoAxeViolations();
    await user.keyboard('{Escape}');
    rerender(
      <AppSidebarHeader
        workspaces={[]}
        workspaceLabel={workspaceLabel}
        workspaceEmptyText="No team spaces yet"
        onCreateWorkspace={onCreateWorkspace}
      />,
    );
    await user.click(trigger);
    await user.click(within(await screen.findByRole('menu')).getByRole('menuitem', { name: 'Create workspace' }));
    expect(onCreateWorkspace).toHaveBeenCalledOnce();
  });

  it.each([[], null])('keeps the logo or custom brand without the empty-state opt-in (%s)', (workspaces) => {
    const { rerender } = render(<AppSidebarHeader workspaces={workspaces} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<AppSidebarHeader workspaces={workspaces} brand={<span>Console identity</span>} />);
    expect(screen.getByText('Console identity')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('sidebar tenant placeholder', () => {
  it.each([undefined, 'Selecciona un tenant'])(
    'shows the unselected tenant placeholder (%s)',
    async (tenantPlaceholder) => {
      render(
        <AppSidebarHeader
          tenants={[{ id: 'one', name: 'One' }]}
          currentTenantId={null}
          tenantPlaceholder={tenantPlaceholder}
        />,
      );
      expect(screen.getByRole('combobox', { name: 'Tenant' })).toHaveTextContent(tenantPlaceholder ?? 'Select tenant');
      await expectNoAxeViolations();
    },
  );

  it('uses tenantEmptyText for an empty list even with a custom placeholder', () => {
    render(
      <AppSidebarHeader tenants={[]} tenantPlaceholder="Selecciona un tenant" tenantEmptyText="No organizations" />,
    );
    expect(screen.getByRole('combobox', { name: 'Tenant' })).toHaveTextContent('No organizations');
  });
});
