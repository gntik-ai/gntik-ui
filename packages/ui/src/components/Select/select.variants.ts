import { tv, type VariantProps } from '../../utils/tv';

/** Shared popup surface for Select and Combobox (portal → positioner → popup). */
export const listboxPopup = [
  'max-h-[min(var(--available-height),18rem)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto',
  'rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none',
  'transition-[opacity,scale] duration-150 motion-reduce:transition-none',
  'data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0',
];

/** Shared option row for Select and Combobox. */
export const listboxItem = [
  'flex cursor-default items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] text-foreground outline-none select-none',
  'data-highlighted:bg-secondary/70 data-selected:bg-primary/12 data-selected:data-highlighted:bg-primary/16',
  'data-disabled:cursor-not-allowed data-disabled:opacity-45',
];

export const selectVariants = tv({
  slots: {
    label: 'mb-2 block text-[13px] font-medium text-foreground',
    trigger: [
      'group flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background text-foreground shadow-sm transition-colors select-none',
      'hover:border-muted-foreground/40 data-popup-open:border-primary/60 data-popup-open:ring-2 data-popup-open:ring-ring/25',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    value: 'flex min-w-0 items-center gap-2 truncate data-placeholder:text-muted-foreground',
    icon: 'flex shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-data-popup-open:rotate-180',
    positioner: 'z-50 outline-none',
    popup: listboxPopup,
    list: 'outline-none',
    item: listboxItem,
    itemText: 'flex min-w-0 items-center gap-2 truncate',
    indicator: 'flex shrink-0 text-primary-text',
    groupLabel: 'px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase',
    separator: '-mx-1 my-1 h-px bg-border',
  },
  variants: {
    size: {
      /** Follows `data-density` (comfortable = md). */
      auto: { trigger: 'h-control pe-2.5 ps-field text-[13px]' },
      sm: { trigger: 'h-8 pe-2 ps-2.5 text-[12.5px]' },
      md: { trigger: 'h-9 pe-2.5 ps-3 text-[13px]' },
      lg: { trigger: 'h-11 pe-3 ps-3.5 text-[14.5px] rounded-lg' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type SelectVariantProps = VariantProps<typeof selectVariants>;
