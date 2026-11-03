import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'usePrefersReducedMotion',
  status: 'stable',
  description:
    'usePrefersReducedMotion() is another name for useReducedMotion: the same function, so both return the same value and share one listener. Import usePrefersReducedMotion from @gntik-ai/ui/hooks when you prefer the media-query wording. It is true when the operating system asks for reduced motion or html carries data-motion="reduce".',
  signature: 'usePrefersReducedMotion(): boolean',
  server: 'Returns false, like useReducedMotion (`standard` in the example).',
};
