import { I18nProvider, THEME_OPTIONS, ThemeProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AppTopbar } from './AppTopbar';

describe('AppTopbar', () => {
  it('renders breadcrumb, environment, search, notifications, theme and user', async () => {
    const { container } = render(
      <ThemeProvider storageKey={null}>
        <AppTopbar />
      </ThemeProvider>,
    );
    const crumbs = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(crumbs).getByText('web-frontend')).toBeInTheDocument();
    expect(container.querySelector('[data-environment="production"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  }, 15_000);

  it('opens the notifications and selects one', async () => {
    const user = userEvent.setup();
    const onNotificationSelect = vi.fn();
    render(
      <ThemeProvider storageKey={null}>
        <AppTopbar onNotificationSelect={onNotificationSelect} search={null} theme="segmented" />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await user.click(await screen.findByText('api-gateway reached 97% of its monthly budget'));
    expect(onNotificationSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
  });

  it('hides optional parts with null', () => {
    const { container } = render(
      <AppTopbar breadcrumbs={null} environment={null} search={null} notifications={null} theme={null} user={null} />,
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('cycles only through the supplied theme options', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey={null} defaultMode="dark">
        <AppTopbar themeOptions={THEME_OPTIONS.slice(0, 2)} />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Theme: Dark. Switch to Light' }));
    expect(screen.getByRole('button', { name: 'Theme: Light. Switch to Dark' })).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('high_contrast');
    await user.click(screen.getByRole('button', { name: 'Theme: Light. Switch to Dark' }));
    expect(document.documentElement).toHaveClass('dark');
  });

  it('renders exactly the supplied segmented theme options', () => {
    render(<AppTopbar theme="segmented" themeOptions={THEME_OPTIONS.slice(0, 2)} />);
    const group = screen.getByRole('group', { name: 'Theme' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    expect(within(group).getByRole('button', { name: 'Light' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'Dark' })).toBeInTheDocument();
  });

  it.each([
    ['en', ['Dark', 'High contrast', 'System', 'Light', 'Dark']],
    ['es', ['Oscuro', 'Alto contraste', 'Sistema', 'Claro', 'Oscuro']],
  ])('keeps the four localized default modes (%s)', async (locale, labels) => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale={locale}>
        <ThemeProvider storageKey={null} defaultMode="dark">
          <AppTopbar />
        </ThemeProvider>
      </I18nProvider>,
    );
    for (let i = 0; i < 4; i++) {
      const label =
        locale === 'es'
          ? `Tema: ${labels[i]}. Cambiar a ${labels[i + 1]}`
          : `Theme: ${labels[i]}. Switch to ${labels[i + 1]}`;
      await user.click(screen.getByRole('button', { name: label }));
    }
  });

  it('keeps all four default segmented toggles', () => {
    render(<AppTopbar theme="segmented" />);
    expect(within(screen.getByRole('group', { name: 'Theme' })).getAllByRole('button')).toHaveLength(4);
  });
});
