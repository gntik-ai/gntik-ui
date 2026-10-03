import { tv, type VariantProps } from '../../utils/tv';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

export const navListVariants = tv({
  slots: {
    root: 'flex flex-col gap-4',
    group: 'flex flex-col gap-0.5',
    groupLabel: 'px-2.5 pt-1 pb-1 font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase select-none',
    groupTrigger: [
      'group mb-0.5 flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1 transition-colors select-none hover:bg-accent/40 motion-reduce:transition-none',
      focus,
    ],
    groupTriggerLabel: 'font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase group-hover:text-foreground',
    groupChevron: 'shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-closed:-rotate-90 motion-reduce:transition-none',
    railDivider: 'mx-auto mb-1 h-px w-5 bg-border',
    list: 'm-0 flex list-none flex-col gap-0.5 p-0',
    panel: [
      'h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none',
      'data-starting-style:h-0 data-ending-style:h-0',
    ],
    item: [
      'relative flex h-control cursor-pointer items-center rounded-lg text-[13px] no-underline transition-colors motion-reduce:transition-none',
      'font-medium text-muted-foreground hover:bg-accent/45 hover:text-foreground',
      'aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent-foreground',
      'aria-disabled:pointer-events-none aria-disabled:opacity-50',
      focus,
    ],
    indicator: 'absolute top-1.5 bottom-1.5 start-0 w-[3px] rounded-e bg-primary',
    icon: 'shrink-0',
    label: 'min-w-0 flex-1 truncate text-start',
    badge: 'inline-flex h-[18px] shrink-0 items-center rounded-full bg-secondary px-1.5 font-mono text-[10.5px] text-muted-foreground',
    railBadge: 'absolute top-1.5 end-1.5 size-1.5 rounded-full bg-primary',
    parent: 'w-full font-semibold text-foreground',
    parentChevron: 'shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-closed:-rotate-90 motion-reduce:transition-none',
    subList: 'm-0 mt-0.5 ms-[18px] flex list-none flex-col gap-0.5 border-s border-border p-0 ps-3',
    subItem: [
      'flex h-control-sm cursor-pointer items-center gap-2 rounded-md px-2.5 text-[12.5px] no-underline transition-colors motion-reduce:transition-none',
      'font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground',
      'aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent-foreground',
      focus,
    ],
  },
  variants: {
    collapsed: {
      true: { item: 'mx-auto w-control justify-center' },
      false: { item: 'w-full gap-2.5 px-2.5' },
    },
    current: {
      // On the selected row (bg-accent) the count reads in the row's own foreground.
      true: { badge: 'bg-accent-foreground/12 text-accent-foreground' },
    },
  },
  defaultVariants: { collapsed: false, current: false },
});

export type NavListVariantProps = VariantProps<typeof navListVariants>;
