import { PALETTES } from './palettes.js';
export { PALETTES };

// @gntik-ai/tokens/runtime — the one adapter that canvas/SVG libraries (Recharts,
// React Flow, Monaco) use to read brand tokens at runtime. Values always come
// from the live CSS variables of brand.css, so a theme switch re-skins them.

/** Mobile-first breakpoints shared with the Tailwind bridge. */
export const breakpoints = Object.freeze({ sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' });

/** A min-width media query for a named kit breakpoint. */
export function breakpointQuery(name) {
  return `(min-width: ${breakpoints[name]})`;
}

/** Raw HSL channels of a token, e.g. tokenChannels('--primary') → "145 61% 50%". */
export function tokenChannels(name, el) {
  if (typeof document === 'undefined') return '';
  const target = el || document.documentElement;
  return getComputedStyle(target)
    .getPropertyValue(name.startsWith('--') ? name : '--' + name)
    .trim();
}

/** CSS colour string for a token, with optional alpha: tokenColor('primary', 0.5). */
export function tokenColor(name, alpha, el) {
  const v = tokenChannels(name, el);
  return alpha == null ? `hsl(${v})` : `hsl(${v} / ${alpha})`;
}

/** Converts a token to #rrggbb (for libraries that reject hsl(), e.g. Monaco themes). */
export function tokenHex(name, el) {
  const [h = 0, s = 0, l = 0] = tokenChannels(name, el)
    .split(/\s+/)
    .map((x) => parseFloat(x) || 0);
  const S = s / 100;
  const L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Active theme from the <html> class: "dark" | "light" | "high_contrast". */
export function currentTheme(el) {
  if (typeof document === 'undefined') return 'dark';
  const c = (el || document.documentElement).classList;
  return c.contains('high_contrast') ? 'high_contrast' : c.contains('dark') ? 'dark' : 'light';
}

/** Nearest palette id, with green as the default (also on the server). */
export function currentPalette(el) {
  if (typeof document === 'undefined') return 'green';
  const id = (el || document.documentElement).closest('[data-palette]')?.getAttribute('data-palette');
  return PALETTES.includes(id) ? id : 'green';
}

/** Calls cb when a theme or palette on the target or its ancestors changes. */
export function observeTheme(cb, el) {
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return () => {};
  const target = el || document.documentElement;
  const o = new MutationObserver(() => cb(currentTheme(target)));
  for (let ancestor = target; ancestor; ancestor = ancestor.parentElement) {
    o.observe(ancestor, { attributes: true, attributeFilter: ['class', 'data-palette'] });
  }
  return () => o.disconnect();
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

/** OS reduced motion or an explicit scope on the element or any ancestor (default html). */
export function prefersReducedMotion(el) {
  if (typeof document === 'undefined') return false;
  return Boolean(
    (el || document.documentElement).closest('[data-motion="reduce"]') ||
    (typeof window !== 'undefined' && window.matchMedia?.(reducedMotionQuery).matches),
  );
}

/** Subscribe to motion scope and OS changes; returns an unsubscribe function. */
export function observeReducedMotion(cb, el) {
  if (typeof document === 'undefined') return () => {};
  const target = el || document.documentElement;
  const notify = () => cb(prefersReducedMotion(target));
  const media = typeof window !== 'undefined' ? window.matchMedia?.(reducedMotionQuery) : undefined;
  if (media?.addEventListener) media.addEventListener('change', notify);
  else media?.addListener(notify);
  const observer = typeof MutationObserver !== 'undefined' ? new MutationObserver(notify) : undefined;
  // Observe only the target and its ancestors, so unrelated subtree changes do not notify.
  for (let ancestor = target; ancestor; ancestor = ancestor.parentElement) {
    observer?.observe(ancestor, { attributes: true, attributeFilter: ['data-motion'] });
  }
  return () => {
    observer?.disconnect();
    if (media?.removeEventListener) media.removeEventListener('change', notify);
    else media?.removeListener(notify);
  };
}
