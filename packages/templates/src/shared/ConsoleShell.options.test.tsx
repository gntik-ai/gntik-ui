import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { ConsoleShell } from './ConsoleShell';

const account = { name: 'Ada Lovelace', email: 'ada@example.com' };

it('forwards tenant placeholders and the empty workspace opt-in to the header', async () => {
  const user = userEvent.setup();
  render(
    <ConsoleShell
      tenants={[{ id: 'one', name: 'One' }]}
      currentTenantId={null}
      tenantPlaceholder="Selecciona un tenant"
      workspaces={[]}
      workspaceLabel="Team spaces"
      workspaceEmptyText="No team spaces yet"
      topbar={{ user: null }}
    >
      Content
    </ConsoleShell>,
  );
  const sidebar = screen.getByRole('complementary');
  expect(within(sidebar).getByRole('combobox', { name: 'Tenant' })).toHaveTextContent('Selecciona un tenant');
  await user.click(within(sidebar).getByRole('button', { name: 'Team spaces' }));
  const menu = await screen.findByRole('menu');
  expect(within(menu).getByText('No team spaces yet')).toBeInTheDocument();
  expect(within(menu).queryByRole('menuitem', { name: 'Create workspace' })).toBeNull();
  await expectNoAxeViolations();
});

describe('ConsoleShell account override', () => {
  it.each([undefined, <span key="brand">Console identity</span>])(
    'keeps only the footer account when the topbar user is null (brand: %s)',
    async (brand) => {
      render(
        <ConsoleShell user={account} topbar={{ user: null }} brand={brand}>
          Content
        </ConsoleShell>,
      );
      expect(screen.getAllByRole('button', { name: /Ada Lovelace/ })).toHaveLength(1);
      expect(
        within(screen.getByRole('complementary')).getByRole('button', { name: /Ada Lovelace/ }),
      ).toBeInTheDocument();
      expect(within(screen.getByRole('banner')).queryByRole('button', { name: /Ada Lovelace/ })).toBeNull();
      await expectNoAxeViolations();
    },
  );

  it.each([undefined, {}, { user: undefined }])('shares the account when topbar.user is undefined (%s)', (topbar) => {
    render(
      <ConsoleShell user={account} topbar={topbar}>
        Content
      </ConsoleShell>,
    );
    expect(screen.getAllByRole('button', { name: /Ada Lovelace/ })).toHaveLength(2);
  });

  it('uses a distinct topbar account without changing the footer account', () => {
    render(
      <ConsoleShell user={account} topbar={{ user: { name: 'Grace Hopper' } }}>
        Content
      </ConsoleShell>,
    );
    expect(within(screen.getByRole('banner')).getByRole('button', { name: /Grace Hopper/ })).toBeInTheDocument();
    expect(within(screen.getByRole('complementary')).getByRole('button', { name: /Ada Lovelace/ })).toBeInTheDocument();
  });
});

describe('ConsoleShell navigation name', () => {
  it.each([undefined, 'Navegación principal'])('names desktop and mobile navigation (%s)', async (navLabel) => {
    const user = userEvent.setup();
    const originalWidth = window.innerWidth;
    window.innerWidth = 375;
    try {
      render(<ConsoleShell navLabel={navLabel}>Content</ConsoleShell>);
      expect(
        within(screen.getByRole('complementary')).getByRole('navigation', { name: navLabel ?? 'Main' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Open navigation' }));
      const drawer = await screen.findByRole('dialog', { name: 'Sidebar' });
      expect(within(drawer).getByRole('navigation', { name: navLabel ?? 'Main' })).toBeInTheDocument();
    } finally {
      window.innerWidth = originalWidth;
    }
  });
});

describe('ConsoleShell footer theme control', () => {
  it.each([undefined, true, false])('forwards the footer theme option (%s)', async (showTheme) => {
    render(
      <ConsoleShell user={account} userMenuShowTheme={showTheme}>
        Content
      </ConsoleShell>,
    );
    await userEvent.click(within(screen.getByRole('complementary')).getByRole('button', { name: /Ada Lovelace/ }));
    const theme = within(await screen.findByRole('menu')).queryByRole('menuitem', { name: 'Theme' });
    if (showTheme === false) expect(theme).toBeNull();
    else expect(theme).toBeInTheDocument();
  });
});
