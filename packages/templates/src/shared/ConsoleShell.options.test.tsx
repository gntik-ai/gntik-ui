import { I18nProvider, THEME_OPTIONS, ThemeProvider } from '@gntik-ai/ui';
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
  it.each([undefined, 'Navegación principal'])(
    'names navigation in the sidebar and opened drawer (%s)',
    async (navLabel) => {
      const user = userEvent.setup();
      render(<ConsoleShell navLabel={navLabel}>Content</ConsoleShell>);
      expect(
        within(screen.getByRole('complementary')).getByRole('navigation', { name: navLabel ?? 'Main' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Open navigation' }));
      const drawer = await screen.findByRole('dialog', { name: 'Sidebar' });
      expect(within(drawer).getByRole('navigation', { name: navLabel ?? 'Main' })).toBeInTheDocument();
    },
  );
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

describe('ConsoleShell main and topbar options', () => {
  it('forwards mainLabel to the overflowing main landmark', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.tagName === 'MAIN' ? 300 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100);
    try {
      render(
        <ConsoleShell mainLabel="Reading area">
          <p>Static content</p>
        </ConsoleShell>,
      );
      expect(await screen.findByRole('main', { name: 'Reading area' })).toHaveAttribute('tabindex', '0');
    } finally {
      vi.restoreAllMocks();
    }
  });

  it.each([undefined, <span key="brand">Console identity</span>])(
    'forwards two theme options through the topbar (brand: %s)',
    async (brand) => {
      const user = userEvent.setup();
      render(
        <ThemeProvider storageKey={null} defaultMode="dark">
          <ConsoleShell brand={brand} topbar={{ themeOptions: THEME_OPTIONS.slice(0, 2) }}>
            Content
          </ConsoleShell>
        </ThemeProvider>,
      );
      const banner = within(screen.getByRole('banner'));
      await user.click(banner.getByRole('button', { name: 'Theme: Dark. Switch to Light' }));
      expect(document.documentElement).not.toHaveClass('dark');
      expect(document.documentElement).not.toHaveClass('high_contrast');
      await user.click(banner.getByRole('button', { name: 'Theme: Light. Switch to Dark' }));
      expect(document.documentElement).toHaveClass('dark');
    },
  );

  it('keeps the four localized default theme modes through ConsoleShell', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <ThemeProvider storageKey={null} defaultMode="dark">
          <ConsoleShell>Content</ConsoleShell>
        </ThemeProvider>
      </I18nProvider>,
    );
    for (const name of [
      'Tema: Oscuro. Cambiar a Alto contraste',
      'Tema: Alto contraste. Cambiar a Sistema',
      'Tema: Sistema. Cambiar a Claro',
      'Tema: Claro. Cambiar a Oscuro',
    ]) {
      await user.click(within(screen.getByRole('banner')).getByRole('button', { name }));
    }
  });
});
