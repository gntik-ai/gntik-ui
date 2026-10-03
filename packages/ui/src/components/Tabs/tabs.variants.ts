import { tv, type VariantProps } from '../../utils/tv';

export const tabsVariants = tv({
  slots: {
    root: 'flex flex-col gap-4',
    list: 'relative',
    tab: [
      'group relative z-[1] inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap select-none',
      'text-muted-foreground transition-colors hover:text-foreground data-active:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
    ],
    icon: 'shrink-0 transition-colors group-data-active:text-primary-text',
    count: [
      'inline-flex h-[18px] items-center rounded-full px-1.5 font-mono text-[10.5px] leading-none transition-colors',
      'bg-secondary text-muted-foreground group-data-active:bg-primary/14 group-data-active:text-primary-chip-text',
    ],
    indicator: 'absolute top-0 start-0 transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none',
    panel: 'text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm',
  },
  variants: {
    variant: {
      underline: {
        list: 'flex items-center gap-6 border-b border-border',
        tab: 'h-tab -mb-px border-b-2 border-transparent text-[13px] rounded-t-sm',
        indicator: 'top-auto -bottom-px h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-primary',
      },
      pills: {
        list: 'inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1',
        tab: 'h-control-sm rounded-md px-control text-[12.5px]',
        indicator:
          'z-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) rounded-md bg-card shadow-sm',
      },
    },
    /** When false, the active tab is styled statically instead of by the sliding indicator. */
    indicator: { true: {}, false: {} },
    fullWidth: { true: { list: 'grid w-full auto-cols-fr grid-flow-col' }, false: {} },
  },
  compoundVariants: [
    { variant: 'underline', indicator: false, class: { tab: 'data-active:border-primary' } },
    { variant: 'pills', indicator: false, class: { tab: 'data-active:bg-card data-active:shadow-sm' } },
    { variant: 'pills', fullWidth: true, class: { tab: 'h-control' } },
  ],
  defaultVariants: { variant: 'underline', indicator: true, fullWidth: false },
});

export type TabsVariantProps = VariantProps<typeof tabsVariants>;
