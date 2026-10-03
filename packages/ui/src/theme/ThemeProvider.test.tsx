import { act, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, themeScript, useTheme, type ThemeMode } from './ThemeProvider';
import { themeScript as serverThemeScript } from './theme-script';
import { Logo } from './Logo';
import { musematicPreset } from './presets';

function Switcher() {
  const { mode, resolved, setMode } = useTheme();
  return (
    <div>
      <span data-testid="state">{mode}/{resolved}</span>
      {(['light', 'dark', 'high_contrast'] as ThemeMode[]).map((m) => (
        <button key={m} onClick={() => setMode(m)}>{m}</button>
      ))}
    </div>
  );
}

describe('ThemeProvider', () => {
  it('defaults to dark and sets the class on <html>', () => {
    render(<ThemeProvider><Switcher /></ThemeProvider>);
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByTestId('state')).toHaveTextContent('dark/dark');
  });

  it('switches theme, persists it and restores it', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ThemeProvider><Switcher /></ThemeProvider>);
    await user.click(screen.getByText('high_contrast'));
    expect(document.documentElement).toHaveClass('high_contrast');
    expect(document.documentElement).not.toHaveClass('dark');
    await user.click(screen.getByText('light'));
    expect(document.documentElement.className).toBe('');
    expect(localStorage.getItem('gntik-theme')).toBe('light');
    unmount();
    render(<ThemeProvider><Switcher /></ThemeProvider>);
    expect(screen.getByTestId('state')).toHaveTextContent('light/light');
  });

  it('exposes the brand preset to Logo', () => {
    render(<ThemeProvider brand={musematicPreset}><Logo wordmark /></ThemeProvider>);
    expect(screen.getByRole('img', { name: 'musematic' })).toBeInTheDocument();
    expect(document.documentElement.dataset.brand).toBe('musematic');
  });

  it('Logo falls back to the neutral gntik preset', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: 'gntik' })).toBeInTheDocument();
  });

  it('server-renders defaultMode / initialMode and ignores the stored value there', () => {
    localStorage.setItem('gntik-theme', 'light');
    const ssr = (ui: ReactElement) => renderToString(ui).replaceAll('<!-- -->', '');
    expect(ssr(<ThemeProvider><Switcher /></ThemeProvider>)).toContain('dark/dark');
    expect(ssr(<ThemeProvider defaultMode="light"><Switcher /></ThemeProvider>)).toContain('light/light');
    expect(ssr(<ThemeProvider initialMode="high_contrast"><Switcher /></ThemeProvider>)).toContain('high_contrast/high_contrast');
  });

  it('hydrates with defaultMode, then applies the stored mode after mount without a mismatch', async () => {
    localStorage.setItem('gntik-theme', 'light');
    const ui = <ThemeProvider><Switcher /></ThemeProvider>;
    const container = document.createElement('div');
    container.innerHTML = renderToString(ui);
    document.body.appendChild(container);
    expect(container).toHaveTextContent('dark/dark');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await act(async () => hydrateRoot(container, ui));
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    expect(container).toHaveTextContent('light/light');
    expect(document.documentElement.className).toBe('');
    act(() => root.unmount());
    container.remove();
  });

  it('switching persists across providers on the same key', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ThemeProvider><Switcher /></ThemeProvider>
        <ThemeProvider target={() => null}><Switcher /></ThemeProvider>
      </>,
    );
    await user.click(screen.getAllByText('high_contrast')[0]!);
    expect(localStorage.getItem('gntik-theme')).toBe('high_contrast');
    for (const s of screen.getAllByTestId('state')) expect(s).toHaveTextContent('high_contrast/high_contrast');
  });

  it('without storage keeps the mode in state', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider storageKey={null} defaultMode="light"><Switcher /></ThemeProvider>);
    expect(screen.getByTestId('state')).toHaveTextContent('light/light');
    await user.click(screen.getByText('dark'));
    expect(screen.getByTestId('state')).toHaveTextContent('dark/dark');
    expect(localStorage.getItem('gntik-theme')).toBeNull();
  });

  it('themeScript is the server-safe function re-exported', () => {
    expect(themeScript).toBe(serverThemeScript);
    expect(themeScript('k', 'light')).toContain('"k"');
  });
});
