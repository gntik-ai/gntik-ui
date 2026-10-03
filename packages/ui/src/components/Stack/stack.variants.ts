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
