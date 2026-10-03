import { ThemeProvider } from '@gntik-ai/ui';
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
