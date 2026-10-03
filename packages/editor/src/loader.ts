import { useEffect, useState } from 'react';
import { observeTheme } from '@gntik-ai/tokens/runtime';
import type * as MonacoNamespace from 'monaco-editor';
import { brandThemeFor, defineBrandThemes } from './theme';

/** The `monaco-editor` ESM module. */
export type Monaco = typeof MonacoNamespace;
/** Returns the Monaco module; inject one to self-host, preconfigure or mock Monaco. */
export type MonacoLoader = () => Promise<Monaco>;

let cached: Promise<Monaco> | undefined;

/** Default loader: a dynamic `import('monaco-editor')`, so Monaco lands in its own chunk. */
export const loadMonaco: MonacoLoader = () => {
  cached ??= import('monaco-editor').then((m) => {
    // Webfonts load late: re-measure glyph metrics once they are ready.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => m.editor.remeasureFonts());
    }
    return m;
  });
  cached.catch(() => {
    cached = undefined;
  });
  return cached;
};

export type MonacoState =
  | { status: 'loading'; monaco: null }
  | { status: 'ready'; monaco: Monaco }
  | { status: 'error'; monaco: null; error: unknown };

/** Loads Monaco once per loader and reports its state. */
export function useMonaco(loader: MonacoLoader = loadMonaco): MonacoState {
  // State is keyed by loader, so a new loader reads as "loading" without a sync setState.
  const [entry, setEntry] = useState<{ loader: MonacoLoader; state: MonacoState } | null>(null);
  useEffect(() => {
    let alive = true;
    loader().then(
      (monaco) => alive && setEntry({ loader, state: { status: 'ready', monaco } }),
      (error: unknown) => alive && setEntry({ loader, state: { status: 'error', monaco: null, error } }),
    );
    return () => {
      alive = false;
    };
  }, [loader]);
  return entry && entry.loader === loader ? entry.state : { status: 'loading', monaco: null };
}

/** Registers the brand themes, applies the active one and re-skins on every <html> theme switch. */
export function useBrandTheme(monaco: Monaco | null): void {
  useEffect(() => {
    if (!monaco) return undefined;
    const apply = () => {
      defineBrandThemes(monaco);
      monaco.editor.setTheme(brandThemeFor());
    };
    apply();
    return observeTheme(apply);
  }, [monaco]);
}

/** Brand defaults shared by both editors (Geist Mono, flat chrome, no overview ruler). */
export const BASE_OPTIONS = {
  automaticLayout: true,
  fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
  lineHeight: 21,
  fontLigatures: false,
  letterSpacing: 0.2,
  padding: { top: 14, bottom: 14 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'all',
  roundedSelection: true,
  tabSize: 2,
  insertSpaces: true,
  guides: { indentation: true, bracketPairs: true },
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  fixedOverflowWidgets: true,
  minimap: { enabled: false },
} as const satisfies MonacoNamespace.editor.IStandaloneEditorConstructionOptions;

/** Forces a few layout passes: containers and webfonts often settle after creation. */
export function kickLayout(layout: () => void): () => void {
  const run = () => {
    try {
      layout();
    } catch {
      /* editor already disposed */
    }
  };
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(run) : 0;
  const timers = [setTimeout(run, 70), setTimeout(run, 240)];
  return () => {
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
  };
}
