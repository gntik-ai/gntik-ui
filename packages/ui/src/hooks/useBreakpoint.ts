import { breakpointQuery } from '@gntik-ai/tokens/runtime';
import { BREAKPOINTS, resolveResponsive, type Breakpoint } from '../utils/responsive';
import { useMediaQuery } from './useMediaQuery';

export type { Breakpoint } from '../utils/responsive';

/** Options shared by the breakpoint hooks. */
export interface BreakpointOptions {
  /** Server, initial hydration and missing-matchMedia value. Defaults to base. */
  fallback?: Breakpoint;
}

/**
 * Return the largest matching kit breakpoint, or `fallback` (base by default)
 * on the server and during hydration. Prefer CSS for responsive layout.
 */
export function useBreakpoint({ fallback = 'base' }: BreakpointOptions = {}): Breakpoint {
  const fallbackIndex = BREAKPOINTS.indexOf(fallback);
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
  return resolveResponsive<T>(values, useBreakpoint(options));
}
