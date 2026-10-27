import { responsiveClasses, responsiveVars, resolveResponsive, isResponsiveObject } from './responsive';
import { GRID_COLS } from '../components/Grid/grid.variants';

describe('responsiveClasses', () => {
  it('maps scalars and defined breakpoints in mobile-first order', () => {
    expect(responsiveClasses({ base: 1, md: 2, xl: 4 }, GRID_COLS)).toEqual([
      'grid-cols-1',
      'md:grid-cols-2',
      'xl:grid-cols-4',
    ]);
    expect(responsiveClasses({ xl: 4, base: 1, md: 2 }, GRID_COLS)).toEqual([
      'grid-cols-1',
      'md:grid-cols-2',
      'xl:grid-cols-4',
    ]);
    expect(responsiveClasses(3, GRID_COLS)).toEqual(['grid-cols-3']);
    expect(responsiveClasses(undefined, GRID_COLS)).toEqual([]);
    const unknown = { phone: 3, md: undefined, xl: 99 };
    expect(responsiveClasses(unknown, GRID_COLS)).toEqual([]);
  });

  it('looks up boolean keys and invokes function tables once per defined breakpoint', () => {
    const table = {
      base: { true: 'block', false: 'hidden' },
      sm: {},
      md: { false: 'md:hidden' },
      lg: {},
      xl: {},
      '2xl': {},
    };
    expect(responsiveClasses({ md: false, base: true }, table)).toEqual(['block', 'md:hidden']);
    const calls: string[] = [];
    expect(
      responsiveClasses({ xl: 4, base: 1, md: undefined }, (bp, value) => {
        calls.push(`${bp}:${value}`);
        return bp === 'base' ? 'grid-cols-1' : undefined;
      }),
    ).toEqual(['grid-cols-1']);
    expect(calls).toEqual(['base:1', 'xl:4']);
  });
});

describe('responsiveVars', () => {
  it('maps scalar and breakpoint values to CSS variables, stringifying numbers', () => {
    expect(responsiveVars('dialog-width', { md: '32rem', base: '100%' })).toEqual({
      '--dialog-width': '100%',
      '--dialog-width-md': '32rem',
    });
    expect(responsiveVars('size', 24)).toEqual({ '--size': '24' });
    expect(responsiveVars('size', { base: 0, '2xl': 96 })).toEqual({ '--size': '0', '--size-2xl': '96' });
    expect(responsiveVars('size', 'auto')).toEqual({ '--size': 'auto' });
    expect(responsiveVars('size', undefined)).toEqual({});
    const unknown = { phone: 20, md: undefined };
    expect(responsiveVars('size', unknown)).toEqual({});
  });
});

describe('resolveResponsive', () => {
  it('falls back to the nearest defined breakpoint, or returns the scalar', () => {
    expect(resolveResponsive({ base: 'sheet', md: 'dialog' }, 'lg')).toBe('dialog');
    expect(resolveResponsive({ base: 'sheet', md: 'dialog' }, 'sm')).toBe('sheet');
    expect(resolveResponsive({ md: 'dialog' }, 'base')).toBeUndefined();
    expect(resolveResponsive({ base: false, md: undefined }, '2xl')).toBe(false);
    expect(resolveResponsive('dialog', 'md')).toBe('dialog');
    expect(resolveResponsive(0, 'base')).toBe(0);
    expect(resolveResponsive(undefined, 'base')).toBeUndefined();
    expect(isResponsiveObject({ md: 1 })).toBe(true);
    expect(isResponsiveObject(1)).toBe(false);
    expect(isResponsiveObject(undefined)).toBe(false);
    expect(isResponsiveObject(null)).toBe(false);
  });
});
