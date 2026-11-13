import { tv, type VariantProps } from '../../utils/tv';

/**
 * Month grid in the brand style: 32px day cells, primary fill on the selection, an inset
 * primary ring on today, a primary/12 band across a range. Day state comes from data attributes.
 * Markers are up to three 4px token-coloured dots pinned to the bottom of the day; `tone: 'selected'`
 * is the on-primary colour of a selected day. Forced colours repaint them with system colours.
 */
export const calendarVariants = tv({
  slots: {
    root: 'inline-flex w-fit flex-col gap-4 p-3 text-foreground sm:flex-row sm:gap-6',
    month: 'flex flex-col',
    header: 'mb-2 flex h-7 items-center justify-between gap-2',
    heading: 'flex-1 text-center text-[13px] font-semibold tracking-tight text-foreground',
    headingButton: ['rounded-md px-1 hover:bg-secondary/70', 'focus-ring'],
    nav: [
      'grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary/70 hover:text-foreground',
      'focus-ring',
      'disabled:cursor-disabled disabled:text-muted-foreground/30 disabled:hover:bg-transparent',
    ],
    navSpacer: 'size-7 shrink-0',
    grid: 'w-[224px] border-collapse',
    weekday: 'h-7 p-0 text-center font-mono text-[10.5px] font-normal text-muted-foreground',
    weekdayAbbr: 'no-underline',
    cell: [
      'h-8 p-0 text-center',
      'data-in-range:bg-primary/12 data-range-start:rounded-s-md data-range-end:rounded-e-md',
    ],
    day: [
      'mx-auto grid size-8 place-items-center rounded-md text-[12.5px] text-foreground tabular-nums outline-none select-none',
      'transition-colors motion-reduce:transition-none hover:bg-secondary/70',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'data-today:ring-1 data-today:ring-primary/60 data-today:ring-inset',
      'data-in-range:hover:bg-primary/16',
      'data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground data-selected:ring-0 data-selected:hover:bg-primary/90 forced-colors:data-selected:bg-[Highlight] forced-colors:data-selected:text-[HighlightText] forced-colors:data-selected:[&_*]:text-[HighlightText] forced-colors:data-selected:hover:bg-[Highlight] forced-colors:data-selected:hover:text-[HighlightText] forced-colors:data-selected:hover:[&_*]:text-[HighlightText]',
      'aria-disabled:cursor-disabled aria-disabled:text-muted-foreground/30 aria-disabled:line-through aria-disabled:hover:bg-transparent',
    ],
    dayDecorated: 'relative',
    markers: 'pointer-events-none absolute inset-x-0 bottom-1 flex items-center justify-center gap-0.5',
    marker: 'size-1 shrink-0 rounded-full forced-colors:bg-[CanvasText]',
    loadingIndicator: 'ms-1.5 -me-4.5 inline-block align-middle text-muted-foreground',
    outside: 'mx-auto grid size-8 place-items-center text-[12.5px] text-muted-foreground tabular-nums select-none',
  },
  variants: {
    tone: {
      primary: { marker: 'bg-primary' },
      success: { marker: 'bg-success' },
      warning: { marker: 'bg-warning' },
      destructive: { marker: 'bg-destructive' },
      info: { marker: 'bg-info' },
      neutral: { marker: 'bg-muted-foreground' },
      selected: { marker: 'bg-primary-foreground forced-colors:bg-[HighlightText]' },
    },
  },
});

export type CalendarVariantProps = VariantProps<typeof calendarVariants>;
