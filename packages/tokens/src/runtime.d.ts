export { PALETTES, type PaletteId } from './palettes.js';
import type { PaletteId } from './palettes.js';
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
/** Nearest palette, or green when none is set (also on the server). */
export function currentPalette(el?: Element): PaletteId;
/** Subscribes to theme and palette changes on the target and its ancestors. */
export function observeTheme(cb: (theme: Theme) => void, el?: Element): () => void;
/** OS reduced motion or a data-motion="reduce" scope (default html). False on the server. */
export function prefersReducedMotion(el?: Element): boolean;
/** Observe motion scope and OS changes. Returns an unsubscribe function; safe on the server. */
export function observeReducedMotion(cb: (reduced: boolean) => void, el?: Element): () => void;
