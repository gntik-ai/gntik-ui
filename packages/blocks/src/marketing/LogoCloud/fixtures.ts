import { createElement } from 'react';
import type { LogoCloudItem } from './LogoCloud';

/** Neutral placeholder marks, never customer assets. Supply your own currentColor SVGs. */
export const sampleLogos: LogoCloudItem[] = (
  [
    ['acme', 'Acme', 96, 'M14 0 28 28H0z'],
    ['example', 'Example', 128, 'M0 0h28v28H0z'],
    ['sample', 'Sample', 118, 'M14 0 28 14 14 28 0 14z'],
    ['demo', 'Demo', 100, 'M0 0h12v28H0zM16 0h12v28H16z'],
    ['placeholder', 'Placeholder', 166, 'M0 0h28v12H0zM0 16h28v12H0z'],
    ['studio', 'Studio', 108, 'M0 0h12v16h16v12H0z'],
  ] as const
).map(([id, name, width, path]) => ({
  id,
  name,
  mark: createElement(
    'svg',
    { viewBox: `0 0 ${width} 28`, fill: 'currentColor', focusable: 'false' },
    createElement('path', { d: path }),
    createElement('text', { x: 36, y: 21, fontSize: 20, fontWeight: 600 }, name),
  ),
}));
