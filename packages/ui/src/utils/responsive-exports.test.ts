import { expectTypeOf } from 'vitest';
import {
  BREAKPOINTS,
  responsiveClasses,
  responsiveVars,
  resolveResponsive,
  isResponsiveObject,
  type Breakpoint,
  type Responsive,
  type GridBreakpoint,
} from '@gntik-ai/ui';
import type { Breakpoint as HookBreakpoint } from '../hooks/useBreakpoint';
import type { Breakpoint as UtilityBreakpoint, Responsive as UtilityResponsive } from './responsive';
import type { Responsive as GridResponsive } from '../components/Grid';

it('exports the responsive helpers and the same canonical types at existing public seams', () => {
  expect(BREAKPOINTS).toEqual(['base', 'sm', 'md', 'lg', 'xl', '2xl']);
  expect(responsiveClasses(1, () => 'grid-cols-1')).toEqual(['grid-cols-1']);
  expect(responsiveVars('width', 12)).toEqual({ '--width': '12' });
  expect(resolveResponsive({ base: 1 }, 'md')).toBe(1);
  expect(isResponsiveObject({ md: 1 })).toBe(true);
  expectTypeOf<Breakpoint>().toEqualTypeOf<UtilityBreakpoint>();
  expectTypeOf<HookBreakpoint>().toEqualTypeOf<UtilityBreakpoint>();
  expectTypeOf<GridBreakpoint>().toEqualTypeOf<UtilityBreakpoint>();
  expectTypeOf<Responsive<number>>().toEqualTypeOf<UtilityResponsive<number>>();
  expectTypeOf<GridResponsive<number>>().toEqualTypeOf<UtilityResponsive<number>>();
});
