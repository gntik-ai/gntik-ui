// @gntik-ai/tokens/runtime — the one adapter that canvas/SVG libraries (Recharts,
// React Flow, Monaco) use to read brand tokens at runtime. Values always come
// from the live CSS variables of brand.css, so a theme switch re-skins them.

/** Raw HSL channels of a token, e.g. tokenChannels('--primary') → "145 61% 50%". */
export function tokenChannels(name, el) {
  if (typeof document === 'undefined') return '';
  const target = el || document.documentElement;
  return getComputedStyle(target).getPropertyValue(name.startsWith('--') ? name : '--' + name).trim();
}

/** CSS colour string for a token, with optional alpha: tokenColor('primary', 0.5). */
export function tokenColor(name, alpha, el) {
  const v = tokenChannels(name, el);
  return alpha == null ? `hsl(${v})` : `hsl(${v} / ${alpha})`;
}

/** Converts a token to #rrggbb (for libraries that reject hsl(), e.g. Monaco themes). */
export function tokenHex(name, el) {
  const [h = 0, s = 0, l = 0] = tokenChannels(name, el).split(/\s+/).map((x) => parseFloat(x) || 0);
  const S = s / 100;
  const L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Active theme from the <html> class: "dark" | "light" | "high_contrast". */
export function currentTheme(el) {
  if (typeof document === 'undefined') return 'dark';
  const c = (el || document.documentElement).classList;
  return c.contains('high_contrast') ? 'high_contrast' : c.contains('dark') ? 'dark' : 'light';
}

/** Calls `cb` whenever the theme class on <html> changes. Returns an unsubscribe function. */
export function observeTheme(cb, el) {
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return () => {};
  const target = el || document.documentElement;
  const o = new MutationObserver(() => cb(currentTheme(target)));
  o.observe(target, { attributes: true, attributeFilter: ['class'] });
  return () => o.disconnect();
}
