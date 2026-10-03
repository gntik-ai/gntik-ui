import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { gntikPreset, type BrandPreset } from './presets';
import type { ResolvedTheme, ThemeMode } from './theme-script';

export { themeScript, type ThemeMode, type ResolvedTheme } from './theme-script';

/** Theme class per resolved mode. Light is the token default (:root), so it adds no class. */
const THEME_CLASS: Record<ResolvedTheme, string> = { dark: 'dark', light: '', high_contrast: 'high_contrast' };
const ALL_CLASSES = ['dark', 'high_contrast'];
const SYSTEM_QUERIES = ['(prefers-color-scheme: light)', '(prefers-contrast: more)'];

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  brand: BrandPreset;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  if (window.matchMedia('(prefers-contrast: more)').matches) return 'high_contrast';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function subscribeSystem(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const queries = SYSTEM_QUERIES.map((q) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener('change', onChange));
}

function readStored(key: string): ThemeMode | null {
  try {
    const v = localStorage.getItem(key);
    return v === 'dark' || v === 'light' || v === 'high_contrast' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

/** Same-tab writes (the `storage` event only fires in other tabs). */
const storeListeners = new Set<() => void>();

function subscribeStored(onChange: () => void) {
  storeListeners.add(onChange);
  if (typeof window !== 'undefined') window.addEventListener('storage', onChange);
  return () => {
    storeListeners.delete(onChange);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onChange);
  };
}

const serverStored = () => null;
const serverSystem = (): ResolvedTheme => 'dark';

export interface ThemeProviderProps {
  children: ReactNode;
  /** Mode when nothing is stored. Dark is the kit default. */
  defaultMode?: ThemeMode;
  /**
   * Mode for the server render and hydration (e.g. read from a cookie); defaults to `defaultMode`.
   * The stored choice, if any, applies right after hydration.
   */
  initialMode?: ThemeMode;
  /** Brand preset (name + logo). Colours are the same for every preset. */
  brand?: BrandPreset;
  /** localStorage key; pass `null` to disable persistence. */
  storageKey?: string | null;
  /** Element that receives the theme class. Defaults to <html>. */
  target?: () => HTMLElement | null;
}

/**
 * Applies the theme class to <html> (dark · light · high_contrast, or follows the OS),
 * persists the choice and exposes the brand preset. SSR-safe: the server and hydration render
 * use `initialMode ?? defaultMode`; the stored mode and the OS preference are read through
 * useSyncExternalStore, so they apply right after hydration without a mismatch. To avoid a
 * flash on load, inline `themeScript()` in the document <head>.
 */
export function ThemeProvider({
  children,
  defaultMode = 'dark',
  initialMode,
  brand = gntikPreset,
  storageKey = 'gntik-theme',
  target = () => (typeof document === 'undefined' ? null : document.documentElement),
}: ThemeProviderProps) {
  const [localMode, setLocalMode] = useState<ThemeMode>(initialMode ?? defaultMode);
  const getStored = useCallback(() => (storageKey ? readStored(storageKey) : null), [storageKey]);
  const stored = useSyncExternalStore(subscribeStored, getStored, serverStored);
  const system = useSyncExternalStore(subscribeSystem, systemTheme, serverSystem);
  const mode = stored ?? localMode;
  const resolved = mode === 'system' ? system : mode;

  useEffect(() => {
    const el = target();
    if (!el) return;
    el.classList.remove(...ALL_CLASSES);
    const cls = THEME_CLASS[resolved];
    if (cls) el.classList.add(cls);
    el.style.colorScheme = resolved === 'light' ? 'light' : 'dark';
    el.dataset.brand = brand.id;
  }, [resolved, brand.id, target]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setLocalMode(next);
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, next);
      } catch {}
      storeListeners.forEach((l) => l());
    },
    [storageKey],
  );

  const value = useMemo(() => ({ mode, resolved, setMode, brand }), [mode, resolved, setMode, brand]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Current theme and brand. Outside a provider it reports the dark default and the gntik preset. */
export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? { mode: 'dark', resolved: 'dark', setMode: () => {}, brand: gntikPreset }
  );
}
