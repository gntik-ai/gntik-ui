import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  document.documentElement.className = '';
  try { localStorage.clear(); } catch {}
});

// jsdom gaps that Base UI touches (positioning, animations, media queries).
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
if (!('ResizeObserver' in window)) {
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

// Recharts' ResponsiveContainer measures its parent; jsdom reports 0×0, so give it a size.
Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return { x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 300, width: 600, height: 300, toJSON: () => ({}) } as DOMRect;
};
