import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useReducedMotion',
  status: 'stable',
  description:
    'useReducedMotion() is true when the operating system asks for reduced motion or html carries data-motion="reduce", and updates when either changes. Import useReducedMotion from @gntik-ai/ui/hooks. Use it to skip JavaScript-driven animation; CSS motion is already switched off by the kit styles. It uses a stable value during server rendering and the first hydration render, then the client value.',
  signature: 'useReducedMotion(): boolean',
  server: 'Returns false, so the standard motion branch renders (`standard` in the example).',
};
