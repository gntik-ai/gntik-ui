import { vi } from 'vitest';

/** Distinct channels per token and theme, so tests can tell themes apart. */
const HUE: Record<string, number> = {
  '--primary': 145, '--foreground': 10, '--muted-foreground': 20, '--border': 30, '--card': 40,
  '--popover': 50, '--destructive': 0, '--info': 205, '--category-cyan': 190,
  '--category-amber': 38, '--category-violet': 262, '--category-rose': 347,
};
const LIGHTNESS = { light: 40, dark: 60, high_contrast: 80 } as const;

function themeOf(el: Element): keyof typeof LIGHTNESS {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node.classList.contains('high_contrast')) return 'high_contrast';
    if (node.classList.contains('dark')) return 'dark';
  }
  return 'light';
}

/** Mocks getComputedStyle so tokens resolve like brand.css (class on the element or an ancestor). */
export function mockTokens() {
  return vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
    const l = LIGHTNESS[themeOf(el)];
    return {
      getPropertyValue: (name: string) => (name in HUE ? `${HUE[name]} 50% ${l}%` : ''),
    } as unknown as CSSStyleDeclaration;
  });
}
