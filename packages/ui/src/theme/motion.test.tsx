import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { ThemeProvider, useTheme, themeScript } from './ThemeProvider';

afterEach(() => document.documentElement.removeAttribute('data-motion'));

it('sets, persists, restores and removes the motion choice', () => {
  const { result, unmount } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
  expect(result.current.motion).toBe('system');
  act(() => result.current.setMotion('reduce'));
  expect(document.documentElement).toHaveAttribute('data-motion', 'reduce');
  expect(localStorage.getItem('gntik-motion')).toBe('reduce');
  unmount();
  const restored = renderHook(() => useTheme(), { wrapper: ThemeProvider });
  expect(restored.result.current.motion).toBe('reduce');
  act(() => restored.result.current.setMotion('system'));
  expect(document.documentElement).not.toHaveAttribute('data-motion');
  expect(localStorage.getItem('gntik-motion')).toBeNull();
});

it('supports defaults, custom targets and disabled storage', () => {
  const target = document.createElement('div');
  const { result } = renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeProvider defaultMotion="reduce" motionStorageKey={null} target={() => target}>
        {children}
      </ThemeProvider>
    ),
  });
  expect(result.current.motion).toBe('reduce');
  expect(target).toHaveAttribute('data-motion', 'reduce');
  act(() => result.current.setMotion('system'));
  act(() => result.current.setMotion('reduce'));
  expect(localStorage.getItem('gntik-motion')).toBeNull();
});

it('keeps the server motion state independent of storage', () => {
  localStorage.setItem('gntik-motion', 'reduce');
  function State() {
    return <output>{useTheme().motion}</output>;
  }
  expect(
    renderToString(
      <ThemeProvider>
        <State />
      </ThemeProvider>,
    ),
  ).toContain('system');
});

it('restores motion before hydration while retaining positional theme arguments', () => {
  localStorage.setItem('custom-theme', 'light');
  localStorage.setItem('gntik-motion', 'reduce');
  window.eval(themeScript('custom-theme', 'dark'));
  expect(document.documentElement).toHaveAttribute('data-motion', 'reduce');
  expect(document.documentElement.className).toBe('');
  expect(document.documentElement.style.colorScheme).toBe('light');
});

it('supports custom script motion storage and a default without storage', () => {
  localStorage.setItem('motion-choice', 'reduce');
  window.eval(themeScript('gntik-theme', 'light', { motionStorageKey: 'motion-choice' }));
  expect(document.documentElement).toHaveAttribute('data-motion', 'reduce');
  window.eval(themeScript('gntik-theme', 'light', { motionStorageKey: null }));
  expect(document.documentElement).not.toHaveAttribute('data-motion');
  window.eval(themeScript('gntik-theme', 'light', { motionStorageKey: null, defaultMotion: 'reduce' }));
  expect(document.documentElement).toHaveAttribute('data-motion', 'reduce');
});
