import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Breakpoint values',
  group: 'Layout',
  status: 'stable',
  description:
    'useBreakpoint({ fallback = "base" }) returns base, sm, md, lg, xl or 2xl from the shared breakpoint tokens. useBreakpointValue(values, options) resolves the largest defined value at or below that breakpoint, or undefined below the first defined value. The fallback applies on the server, during initial hydration and without matchMedia. Prefer CSS for responsive layout; use hooks when behaviour needs to change. The runtime breakpoints export matches Tailwind defaults: sm 40rem, md 48rem, lg 64rem, xl 80rem and 2xl 96rem.',
};
