import { tv } from '../../utils/tv';

/** Shared internal styles; Calendar must not depend on PeriodPicker. */
export const periodGridVariants = tv({
  slots: {
    grid: 'w-64 border-collapse',
    cell: 'p-0.5 text-center data-in-range:bg-primary/12',
    period: [
      'h-10 w-full rounded-md px-2 text-[12.5px] text-foreground outline-none',
      'transition-colors motion-reduce:transition-none hover:bg-secondary/70',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground',
      'aria-disabled:cursor-disabled aria-disabled:text-muted-foreground aria-disabled:line-through',
    ],
  },
});
