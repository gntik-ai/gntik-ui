export type Theme = 'dark' | 'light' | 'high_contrast';
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
