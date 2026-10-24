import { breakpointQuery } from '@gntik-ai/tokens/runtime';
import { useMediaQuery } from './useMediaQuery';

/** Kit viewport breakpoints, in mobile-first order. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Options shared by the breakpoint hooks. */
export interface BreakpointOptions {
  /** Server, initial hydration and missing-matchMedia value. Defaults to base. */
  fallback?: Breakpoint;
}

const order: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * Return the largest matching kit breakpoint, or `fallback` (base by default)
 * on the server and during hydration. Prefer CSS for responsive layout.
 */
export function useBreakpoint({ fallback = 'base' }: BreakpointOptions = {}): Breakpoint {
  const fallbackIndex = order.indexOf(fallback);
  const sm = useMediaQuery(breakpointQuery('sm'), fallbackIndex >= 1);
  const md = useMediaQuery(breakpointQuery('md'), fallbackIndex >= 2);
  const lg = useMediaQuery(breakpointQuery('lg'), fallbackIndex >= 3);
  const xl = useMediaQuery(breakpointQuery('xl'), fallbackIndex >= 4);
  const xxl = useMediaQuery(breakpointQuery('2xl'), fallbackIndex >= 5);
  return xxl ? '2xl' : xl ? 'xl' : lg ? 'lg' : md ? 'md' : sm ? 'sm' : 'base';
}

/**
 * Resolve the value of the largest defined breakpoint at or below the current one.
 * Returns undefined when no value is defined; options also control the SSR fallback.
 */
export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  options?: BreakpointOptions,
): T | undefined {
  const current = useBreakpoint(options);
  for (let index = order.indexOf(current); index >= 0; index--) {
    const key = order[index];
    if (key !== undefined && values[key] !== undefined) return values[key];
  }
  return undefined;
}
