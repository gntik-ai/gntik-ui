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

// React Flow in jsdom: it reads the zoom from DOMMatrixReadOnly and node sizes from offset*.
if (!('DOMMatrixReadOnly' in window)) {
  (window as unknown as { DOMMatrixReadOnly: unknown }).DOMMatrixReadOnly = class {
    m22: number;
    constructor(transform?: string) {
      const scale = transform?.match(/scale\(([\d.]+)\)/)?.[1];
      this.m22 = scale !== undefined ? Number(scale) : 1;
    }
  };
}
Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: { configurable: true, get() { return 90; } },
  offsetWidth: { configurable: true, get() { return 208; } },
});
