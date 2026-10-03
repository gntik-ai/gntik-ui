/**
 * Theme wiring for SSR. In this app the theme lives in a cookie (not the kit's localStorage key):
 * the root layout reads it, renders the right class on <html> and hands the same mode to
 * ThemeProvider (`defaultMode`, `storageKey={null}`), so server HTML and hydration always agree on
 * theme-aware parts (Logo, ThemeSwitcher, user menu). `ThemeCookieSync` writes it back on change.
 *
 * `themeScript` is the cookie flavour of `themeScript()` from @gntik-ai/ui. It is inlined because
 * @gntik-ai/ui is a 'use client' bundle (a Server Component gets a client reference, not the
 * function), and it is still needed for `system`, which only the browser can resolve before paint.
 */
export const THEME_COOKIE = 'gntik-theme';

export type ThemeMode = 'dark' | 'light' | 'high_contrast' | 'system';
const MODES: readonly string[] = ['dark', 'light', 'high_contrast', 'system'];
export const parseMode = (v: string | undefined): ThemeMode => (v && MODES.includes(v) ? (v as ThemeMode) : 'dark');

/** Class on <html> for a mode, as the kit applies it (light is the token default: no class). */
export const htmlClassFor = (mode: ThemeMode) => (mode === 'light' ? '' : mode === 'system' ? 'dark' : mode);

export const themeCookieValue = (mode: string) => `${THEME_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;

export const themeScript = `(function(){try{var c=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([a-z_]+)/);var m=c?c[1]:"dark";if(m==='system'){var q=function(s){return window.matchMedia(s).matches};m=q('(prefers-contrast: more)')?'high_contrast':q('(prefers-color-scheme: light)')?'light':'dark'}var e=document.documentElement;e.classList.remove('dark','high_contrast');if(m!=='light')e.classList.add(m);e.style.colorScheme=m==='light'?'light':'dark'}catch(_){}})();`;
