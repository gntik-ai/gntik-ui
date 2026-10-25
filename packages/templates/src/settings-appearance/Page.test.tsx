import { I18nProvider, ThemeProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsAppearancePage from './Page';

const renderPage = (props: Parameters<typeof SettingsAppearancePage>[0] = {}) =>
  render(
    <ThemeProvider storageKey={null}>
      <SettingsAppearancePage {...props} />
    </ThemeProvider>,
  );

describe('SettingsAppearancePage', () => {
  it('renders theme, density and language', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getAllByRole('group', { name: 'Theme' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('group', { name: 'Density' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeInTheDocument();
  }, 15000);

  it('switches the theme through useTheme', async () => {
    renderPage();
    const display = screen.getByRole('region', { name: 'Display' });
    const light = within(display).getByRole('button', { name: 'Light' });
    await userEvent.click(light);
    expect(document.documentElement).not.toHaveClass('dark');
    expect(light).toHaveAttribute('aria-pressed', 'true');
  }, 15000);

  it('changes density', async () => {
    const onDensityChange = vi.fn();
    renderPage({ onDensityChange });
    await userEvent.click(screen.getByRole('button', { name: 'Compact' }));
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = renderPage();
    await expectNoAxeViolations(container);
  }, 15000);
});

it('toggles the app motion preference with an accessible switch', async () => {
  renderPage();
  const control = screen.getByRole('switch', { name: 'Reduce motion' });
  expect(control).not.toBeChecked();
  await userEvent.click(control);
  expect(control).toBeChecked();
  expect(document.documentElement).toHaveAttribute('data-motion', 'reduce');
  await userEvent.click(control);
  expect(control).not.toBeChecked();
  expect(document.documentElement).not.toHaveAttribute('data-motion');
});

it.each(['dark', 'light', 'high_contrast'] as const)('motion row is axe clean in %s', async (theme) => {
  const { container } = render(
    <ThemeProvider defaultMode={theme} storageKey={null} motionStorageKey={null}>
      <SettingsAppearancePage />
    </ThemeProvider>,
  );
  await expectNoAxeViolations(container);
});

it('localizes the motion label and description in Spanish', () => {
  render(
    <I18nProvider locale="es">
      <ThemeProvider defaultMotion="reduce" storageKey={null} motionStorageKey={null}>
        <SettingsAppearancePage />
      </ThemeProvider>
    </I18nProvider>,
  );
  expect(screen.getByRole('switch', { name: 'Reducir movimiento' })).toBeChecked();
  expect(screen.getByRole('switch', { name: 'Reducir movimiento' })).toHaveAccessibleDescription(
    'Desactiva las animaciones y transiciones en esta aplicación, aunque tu dispositivo las permita.',
  );
});
