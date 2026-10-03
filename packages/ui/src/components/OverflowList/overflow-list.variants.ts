import { tv, type VariantProps } from '../../utils/tv';

export const overflowListVariants = tv({
  slots: {
    root: 'relative min-w-0',
    list: 'm-0 flex list-none flex-nowrap items-center p-0',
    item: 'shrink-0',
    measure: 'invisible pointer-events-none absolute start-0 top-0 flex h-0 w-max flex-nowrap items-center overflow-hidden',
    trigger: [
      'inline-flex shrink-0 items-center justify-center font-medium text-muted-foreground transition-colors select-none',
      'hover:bg-secondary hover:text-foreground data-popup-open:bg-secondary data-popup-open:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    popup: 'max-h-72 w-60 overflow-y-auto p-1.5',
    popupTitle: 'px-2 pt-1 pb-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase',
    popupList: 'm-0 grid list-none gap-0.5 p-0',
    popupItem: 'flex min-h-8 items-center gap-2 rounded-md px-2 text-[13px] text-foreground',
  },
  variants: {
    variant: {
      chip: {
        list: 'gap-1.5',
        measure: 'gap-1.5',
        trigger: 'h-6 rounded-md border border-border bg-card px-2 text-[11.5px]',
      },
      avatar: {
        list: '-space-x-2.5',
        measure: '-space-x-2.5',
        trigger: 'relative size-8 rounded-full bg-secondary text-[11px] font-semibold ring-2 ring-card',
      },
    },
  },
  defaultVariants: { variant: 'chip' },
});

export type OverflowListVariantProps = VariantProps<typeof overflowListVariants>;
