import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme, type ThemeMode } from './ThemeProvider';
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
});
