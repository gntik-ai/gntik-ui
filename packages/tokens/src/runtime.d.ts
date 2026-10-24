export type Theme = 'dark' | 'light' | 'high_contrast';
/** Mobile-first breakpoints shared with the Tailwind bridge. */
export const breakpoints: {
  readonly sm: '40rem';
  readonly md: '48rem';
  readonly lg: '64rem';
  readonly xl: '80rem';
  readonly '2xl': '96rem';
};
/** A min-width media query for a named kit breakpoint. */
export function breakpointQuery(name: keyof typeof breakpoints): string;
/** Raw HSL channels of a token, e.g. "145 61% 50%". Accepts "primary" or "--primary". */
export function tokenChannels(name: string, el?: Element): string;
/** `hsl(...)` colour string for a token, with optional alpha (0–1). */
export function tokenColor(name: string, alpha?: number | null, el?: Element): string;
/** Token as #rrggbb, for libraries that only accept hex (Monaco themes). */
export function tokenHex(name: string, el?: Element): string;
/** Active theme read from the <html> class. */
export function currentTheme(el?: Element): Theme;
/** Subscribes to theme class changes on <html>; returns an unsubscribe function. */
export function observeTheme(cb: (theme: Theme) => void, el?: Element): () => void;
