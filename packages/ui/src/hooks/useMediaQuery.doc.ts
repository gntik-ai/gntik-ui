import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Media queries and reduced motion',
  group: 'Layout',
  status: 'stable',
  description:
    'useMediaQuery(query, fallback = false) follows a CSS media query with one shared browser listener per query. useReducedMotion() (also exported as usePrefersReducedMotion) follows OS reduced motion or data-motion="reduce" on html, updating when either changes and returns false on the server. Both use a stable fallback during SSR and initial hydration, and useMediaQuery also returns its fallback when matchMedia is unavailable. Prefer CSS for layout and these hooks for behaviour: the client value can change after hydration. Import from @gntik-ai/ui; breakpointQuery and breakpoints come from @gntik-ai/tokens/runtime.',
};
