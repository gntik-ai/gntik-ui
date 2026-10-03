import { tv, type VariantProps } from '../../utils/tv';

const itemBase = [
  'relative flex h-item w-full cursor-default items-center gap-2.5 rounded-[7px] px-2.5 text-start text-[13px] outline-none select-none',
  'text-foreground transition-colors data-highlighted:bg-secondary/70',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
];

export const menuVariants = tv({
  slots: {
    positioner: 'z-50 outline-none',
    popup: [
      'min-w-[208px] origin-[var(--transform-origin)] rounded-[10px] border border-border bg-popover p-1.5 text-popover-foreground shadow-md outline-none',
      'max-h-[var(--available-height)] overflow-y-auto',
      'transition-[opacity,scale] duration-100 motion-reduce:transition-none',
      'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-instant:transition-none',
    ],
    item: itemBase,
    itemIcon: 'shrink-0 text-muted-foreground',
    itemLabel: 'min-w-0 flex-1 truncate',
    shortcut: 'ms-auto ps-3 font-mono text-[10.5px] tracking-wide text-muted-foreground',
    checkbox: [
      'grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-border text-primary-foreground transition-colors',
      'group-data-checked:border-primary group-data-checked:bg-primary',
    ],
    radioIndicator: 'ms-auto shrink-0 text-primary-text',
    subTrigger: [...itemBase, 'data-popup-open:bg-secondary/70'],
    subChevron: 'ms-auto shrink-0 text-muted-foreground rtl:-scale-x-100',
    groupLabel: 'px-2.5 pt-2 pb-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase',
    separator: '-mx-1.5 my-1.5 h-px bg-border',
  },
  variants: {
    destructive: {
      true: {
        item: 'text-destructive-text data-highlighted:bg-destructive/10 data-highlighted:text-destructive-chip-text',
        itemIcon: 'text-destructive-text',
      },
    },
  },
});

export type MenuVariantProps = VariantProps<typeof menuVariants>;
