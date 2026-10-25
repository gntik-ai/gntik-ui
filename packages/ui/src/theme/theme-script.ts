/**
 * Server-safe theme helpers: no React, no 'use client'. Import from `@gntik-ai/ui/theme-script`
 * in a React Server Component (e.g. a Next.js root layout); the main entry re-exports them.
 */

export type ThemeMode = 'dark' | 'light' | 'high_contrast' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;
export type MotionMode = 'system' | 'reduce';

export interface ThemeScriptOptions {
  motionStorageKey?: string | null;
  defaultMotion?: MotionMode;
}

/**
 * Inline script for <head> that applies the stored theme before first paint.
 * Usage: `<script dangerouslySetInnerHTML={{ __html: themeScript() }} />`.
 */
export function themeScript(
  storageKey = 'gntik-theme',
  defaultMode: ThemeMode = 'dark',
  { motionStorageKey = 'gntik-motion', defaultMotion = 'system' }: ThemeScriptOptions = {},
) {
  const motionRead = motionStorageKey == null ? 'null' : `localStorage.getItem(${JSON.stringify(motionStorageKey)})`;
  const motionChoice = defaultMotion === 'reduce' ? 'true' : `${motionRead}==='reduce'`;
  return (
    `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultMode)};if(m==='system'){var q=function(s){return window.matchMedia(s).matches};m=q('(prefers-contrast: more)')?'high_contrast':q('(prefers-color-scheme: light)')?'light':'dark'}var e=document.documentElement;e.classList.remove('dark','high_contrast');if(m!=='light')e.classList.add(m);e.style.colorScheme=m==='light'?'light':'dark'}catch(_){}})();` +
    `(function(){try{var e=document.documentElement;if(${motionChoice})e.dataset.motion='reduce';else delete e.dataset.motion}catch(_){}})();`
  );
}
