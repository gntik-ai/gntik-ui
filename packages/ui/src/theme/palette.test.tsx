import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { gntikPreset } from './presets';
import type { PaletteId } from '@gntik-ai/tokens/runtime';

afterEach(() => document.documentElement.removeAttribute('data-palette'));

it('applies a preset palette, lets the prop override it and switches through useTheme', () => {
  const brand = { ...gntikPreset, palette: 'navy' as const };
  const choice: { palette?: PaletteId } = {};
  const { result, rerender } = renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeProvider brand={brand} palette={choice.palette}>
        {children}
      </ThemeProvider>
    ),
  });
  expect(result.current.palette).toBe('navy');
  expect(document.documentElement).toHaveAttribute('data-palette', 'navy');
  choice.palette = 'green';
  rerender();
  expect(result.current.palette).toBe('green');
  act(() => result.current.setPalette('navy'));
  expect(result.current.palette).toBe('navy');
  expect(document.documentElement).toHaveAttribute('data-palette', 'navy');
});

it('falls back to green for an unknown id and warns once in development, including StrictMode', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { result, rerender } = renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <StrictMode>
        <ThemeProvider palette={'teal' as PaletteId}>{children}</ThemeProvider>
      </StrictMode>
    ),
  });
  expect(result.current.palette).toBe('green');
  expect(document.documentElement).toHaveAttribute('data-palette', 'green');
  rerender();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('teal'));
  warn.mockRestore();
});

it.each([null, 'palette-choice'])('persists a palette only with an explicit storage key: %s', (key) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider paletteStorageKey={key}>{children}</ThemeProvider>
  );
  const { result, unmount } = renderHook(() => useTheme(), { wrapper });
  expect(result.current.palette).toBe('green');
  const write = vi.spyOn(Storage.prototype, 'setItem');
  act(() => result.current.setPalette('navy'));
  expect(document.documentElement).toHaveAttribute('data-palette', 'navy');
  if (key) expect(localStorage.getItem(key)).toBe('navy');
  else expect(write).not.toHaveBeenCalled();
  unmount();
  const restored = renderHook(() => useTheme(), { wrapper });
  expect(restored.result.current.palette).toBe(key ? 'navy' : 'green');
  write.mockRestore();
});

it('reads stored palette before the prop default and safely handles unavailable storage', () => {
  localStorage.setItem('palette-choice', 'navy');
  const { result, unmount } = renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeProvider palette="green" paletteStorageKey="palette-choice">
        {children}
      </ThemeProvider>
    ),
  });
  expect(result.current.palette).toBe('navy');
  unmount();
  const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied');
  });
  const withoutStorage = renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeProvider palette="navy" paletteStorageKey="palette-choice">
        {children}
      </ThemeProvider>
    ),
  });
  expect(withoutStorage.result.current.palette).toBe('navy');
  read.mockRestore();
});

it('restores stored palettes in the head script and uses the default when storage is disabled or denied', async () => {
  const { themeScript } = await import('./theme-script');
  localStorage.setItem('palette-choice', 'navy');
  window.eval(themeScript('theme-choice', 'light', { palette: 'green', paletteStorageKey: 'palette-choice' }));
  expect(document.documentElement).toHaveAttribute('data-palette', 'navy');
  window.eval(themeScript('theme-choice', 'light', { paletteStorageKey: null }));
  expect(document.documentElement).toHaveAttribute('data-palette', 'green');
  const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied');
  });
  window.eval(themeScript('theme-choice', 'light', { palette: 'navy', paletteStorageKey: 'palette-choice' }));
  expect(document.documentElement).toHaveAttribute('data-palette', 'navy');
  read.mockRestore();
  localStorage.setItem('palette-choice', 'teal');
  window.eval(themeScript('theme-choice', 'dark', { paletteStorageKey: 'palette-choice' }));
  expect(document.documentElement).toHaveAttribute('data-palette', 'green');
});
