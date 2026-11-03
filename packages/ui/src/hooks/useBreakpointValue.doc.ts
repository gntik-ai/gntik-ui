import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useBreakpointValue',
  status: 'stable',
  description:
    'useBreakpointValue(values, { fallback = "base" }) resolves the value of the largest breakpoint at or below the current one from a map such as { base: "drawer", lg: "inline" }, or undefined while the current breakpoint is below the first defined key. Import useBreakpointValue from @gntik-ai/ui/hooks. It is built on useBreakpoint, so the fallback applies on the server, during initial hydration and without matchMedia. Prefer CSS for responsive layout; use it when behaviour, not styling, changes with the viewport.',
  signature: 'useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>, { fallback = "base" }?): T | undefined',
  server:
    'Resolves the map against the fallback breakpoint: `drawer` for { base: "drawer", lg: "inline" }, and `undefined below md` when no key is at or below it.',
};
