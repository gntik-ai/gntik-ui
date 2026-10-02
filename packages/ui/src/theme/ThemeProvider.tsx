import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { gntikPreset, type BrandPreset } from './presets';

export type ThemeMode = 'dark' | 'light' | 'high_contrast' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

/** Theme class per resolved mode. Light is the token default (:root), so it adds no class. */
const THEME_CLASS: Record<ResolvedTheme, string> = { dark: 'dark', light: '', high_contrast: 'high_contrast' };
const ALL_CLASSES = ['dark', 'high_contrast'];

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

function readStored(key: string): ThemeMode | null {
  try {
    const v = localStorage.getItem(key);
    return v === 'dark' || v === 'light' || v === 'high_contrast' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Initial mode when nothing is stored. Dark is the kit default. */
  defaultMode?: ThemeMode;
  /** Brand preset (name + logo). Colours are the same for every preset. */
  brand?: BrandPreset;
  /** localStorage key; pass `null` to disable persistence. */
  storageKey?: string | null;
  /** Element that receives the theme class. Defaults to <html>. */
  target?: () => HTMLElement | null;
}

/**
 * Applies the theme class to <html> (dark · light · high_contrast, or follows the OS),
 * persists the choice and exposes the brand preset. To avoid a flash on load, inline
 * `themeScript()` in the document <head>.
 */
export function ThemeProvider({
  children,
  defaultMode = 'dark',
  brand = gntikPreset,
  storageKey = 'gntik-theme',
  target = () => (typeof document === 'undefined' ? null : document.documentElement),
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => (storageKey && readStored(storageKey)) || defaultMode);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);
  const resolved = mode === 'system' ? system : mode;

  useEffect(() => {
    if (mode !== 'system' || !window.matchMedia) return;
    const queries = ['(prefers-color-scheme: light)', '(prefers-contrast: more)'].map((q) => window.matchMedia(q));
    const update = () => setSystem(systemTheme());
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, [mode]);

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
      setModeState(next);
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, next);
      } catch {}
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

/**
 * Inline script for <head> that applies the stored theme before first paint.
 * Usage: `<script dangerouslySetInnerHTML={{ __html: themeScript() }} />`.
 */
export function themeScript(storageKey = 'gntik-theme', defaultMode: ThemeMode = 'dark') {
  return `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultMode)};if(m==='system'){var q=function(s){return window.matchMedia(s).matches};m=q('(prefers-contrast: more)')?'high_contrast':q('(prefers-color-scheme: light)')?'light':'dark'}var e=document.documentElement;e.classList.remove('dark','high_contrast');if(m!=='light')e.classList.add(m);e.style.colorScheme=m==='light'?'light':'dark'}catch(_){}})();`;
}
