import type { Breakpoint } from '../../utils/responsive';
import { tv, type VariantProps } from '../../utils/tv';

/** Spacing scale steps (Tailwind units of 0.25rem). */
export type SpaceScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Static `gap-*` map so Tailwind sees every class. */
export const GAP_CLASSES: Record<SpaceScale, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  7: 'gap-7',
  8: 'gap-8',
  9: 'gap-9',
  10: 'gap-10',
  11: 'gap-11',
  12: 'gap-12',
};

export const stackVariants = tv({
  base: 'flex min-w-0',
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
    inline: {
      true: 'inline-flex',
    },
  },
  defaultVariants: { direction: 'column', wrap: false },
});

export const centerVariants = tv({
  base: 'flex items-center justify-center',
  variants: {
    inline: { true: 'inline-flex' },
  },
});

export type StackVariantProps = VariantProps<typeof stackVariants>;

/** Static gap classes at every kit breakpoint. */
export const GRID_GAP: Record<Breakpoint, Record<SpaceScale, string>> = {
  base: GAP_CLASSES,
  sm: {
    0: 'sm:gap-0',
    1: 'sm:gap-1',
    2: 'sm:gap-2',
    3: 'sm:gap-3',
    4: 'sm:gap-4',
    5: 'sm:gap-5',
    6: 'sm:gap-6',
    7: 'sm:gap-7',
    8: 'sm:gap-8',
    9: 'sm:gap-9',
    10: 'sm:gap-10',
    11: 'sm:gap-11',
    12: 'sm:gap-12',
  },
  md: {
    0: 'md:gap-0',
    1: 'md:gap-1',
    2: 'md:gap-2',
    3: 'md:gap-3',
    4: 'md:gap-4',
    5: 'md:gap-5',
    6: 'md:gap-6',
    7: 'md:gap-7',
    8: 'md:gap-8',
    9: 'md:gap-9',
    10: 'md:gap-10',
    11: 'md:gap-11',
    12: 'md:gap-12',
  },
  lg: {
    0: 'lg:gap-0',
    1: 'lg:gap-1',
    2: 'lg:gap-2',
    3: 'lg:gap-3',
    4: 'lg:gap-4',
    5: 'lg:gap-5',
    6: 'lg:gap-6',
    7: 'lg:gap-7',
    8: 'lg:gap-8',
    9: 'lg:gap-9',
    10: 'lg:gap-10',
    11: 'lg:gap-11',
    12: 'lg:gap-12',
  },
  xl: {
    0: 'xl:gap-0',
    1: 'xl:gap-1',
    2: 'xl:gap-2',
    3: 'xl:gap-3',
    4: 'xl:gap-4',
    5: 'xl:gap-5',
    6: 'xl:gap-6',
    7: 'xl:gap-7',
    8: 'xl:gap-8',
    9: 'xl:gap-9',
    10: 'xl:gap-10',
    11: 'xl:gap-11',
    12: 'xl:gap-12',
  },
  '2xl': {
    0: '2xl:gap-0',
    1: '2xl:gap-1',
    2: '2xl:gap-2',
    3: '2xl:gap-3',
    4: '2xl:gap-4',
    5: '2xl:gap-5',
    6: '2xl:gap-6',
    7: '2xl:gap-7',
    8: '2xl:gap-8',
    9: '2xl:gap-9',
    10: '2xl:gap-10',
    11: '2xl:gap-11',
    12: '2xl:gap-12',
  },
};

export const STACK_DIRECTION: Record<Breakpoint, Record<NonNullable<StackVariantProps['direction']>, string>> = {
  base: {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  },
  sm: {
    row: 'sm:flex-row',
    column: 'sm:flex-col',
    'row-reverse': 'sm:flex-row-reverse',
    'column-reverse': 'sm:flex-col-reverse',
  },
  md: {
    row: 'md:flex-row',
    column: 'md:flex-col',
    'row-reverse': 'md:flex-row-reverse',
    'column-reverse': 'md:flex-col-reverse',
  },
  lg: {
    row: 'lg:flex-row',
    column: 'lg:flex-col',
    'row-reverse': 'lg:flex-row-reverse',
    'column-reverse': 'lg:flex-col-reverse',
  },
  xl: {
    row: 'xl:flex-row',
    column: 'xl:flex-col',
    'row-reverse': 'xl:flex-row-reverse',
    'column-reverse': 'xl:flex-col-reverse',
  },
  '2xl': {
    row: '2xl:flex-row',
    column: '2xl:flex-col',
    'row-reverse': '2xl:flex-row-reverse',
    'column-reverse': '2xl:flex-col-reverse',
  },
};

export const STACK_ALIGN: Record<Breakpoint, Record<NonNullable<StackVariantProps['align']>, string>> = {
  base: {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  },
  sm: {
    start: 'sm:items-start',
    center: 'sm:items-center',
    end: 'sm:items-end',
    stretch: 'sm:items-stretch',
    baseline: 'sm:items-baseline',
  },
  md: {
    start: 'md:items-start',
    center: 'md:items-center',
    end: 'md:items-end',
    stretch: 'md:items-stretch',
    baseline: 'md:items-baseline',
  },
  lg: {
    start: 'lg:items-start',
    center: 'lg:items-center',
    end: 'lg:items-end',
    stretch: 'lg:items-stretch',
    baseline: 'lg:items-baseline',
  },
  xl: {
    start: 'xl:items-start',
    center: 'xl:items-center',
    end: 'xl:items-end',
    stretch: 'xl:items-stretch',
    baseline: 'xl:items-baseline',
  },
  '2xl': {
    start: '2xl:items-start',
    center: '2xl:items-center',
    end: '2xl:items-end',
    stretch: '2xl:items-stretch',
    baseline: '2xl:items-baseline',
  },
};

export const STACK_JUSTIFY: Record<Breakpoint, Record<NonNullable<StackVariantProps['justify']>, string>> = {
  base: {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  },
  sm: {
    start: 'sm:justify-start',
    center: 'sm:justify-center',
    end: 'sm:justify-end',
    between: 'sm:justify-between',
    around: 'sm:justify-around',
    evenly: 'sm:justify-evenly',
  },
  md: {
    start: 'md:justify-start',
    center: 'md:justify-center',
    end: 'md:justify-end',
    between: 'md:justify-between',
    around: 'md:justify-around',
    evenly: 'md:justify-evenly',
  },
  lg: {
    start: 'lg:justify-start',
    center: 'lg:justify-center',
    end: 'lg:justify-end',
    between: 'lg:justify-between',
    around: 'lg:justify-around',
    evenly: 'lg:justify-evenly',
  },
  xl: {
    start: 'xl:justify-start',
    center: 'xl:justify-center',
    end: 'xl:justify-end',
    between: 'xl:justify-between',
    around: 'xl:justify-around',
    evenly: 'xl:justify-evenly',
  },
  '2xl': {
    start: '2xl:justify-start',
    center: '2xl:justify-center',
    end: '2xl:justify-end',
    between: '2xl:justify-between',
    around: '2xl:justify-around',
    evenly: '2xl:justify-evenly',
  },
};

export const STACK_WRAP: Record<Breakpoint, Record<'true' | 'false', string>> = {
  base: {
    true: 'flex-wrap',
    false: 'flex-nowrap',
  },
  sm: {
    true: 'sm:flex-wrap',
    false: 'sm:flex-nowrap',
  },
  md: {
    true: 'md:flex-wrap',
    false: 'md:flex-nowrap',
  },
  lg: {
    true: 'lg:flex-wrap',
    false: 'lg:flex-nowrap',
  },
  xl: {
    true: 'xl:flex-wrap',
    false: 'xl:flex-nowrap',
  },
  '2xl': {
    true: '2xl:flex-wrap',
    false: '2xl:flex-nowrap',
  },
};
