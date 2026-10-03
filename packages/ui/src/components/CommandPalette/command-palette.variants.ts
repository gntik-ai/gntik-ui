import { tv, type VariantProps } from '../../utils/tv';

export const commandPaletteVariants = tv({
  slots: {
    trigger: [
      'inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card pe-2.5 ps-3.5 text-muted-foreground transition-colors',
      'hover:border-ring/50 hover:text-foreground motion-reduce:transition-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    triggerText: 'text-[13px]',
    backdrop: [
      'fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-150 motion-reduce:transition-none',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
    ],
    viewport: 'fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] pb-4',
    popup: [
      'flex max-h-[min(560px,80vh)] w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none',
      'transition-[opacity,scale] duration-150 motion-reduce:transition-none',
      'data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0',
    ],
    inputRow: 'flex h-[52px] shrink-0 items-center gap-2.5 border-b border-border px-4',
    inputIcon: 'shrink-0 text-muted-foreground',
    input: 'h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground',
    results: 'min-h-0 flex-1 overflow-y-auto overscroll-contain py-2',
    list: 'outline-none',
    group: 'px-2 pb-1.5',
    groupLabel: 'px-2.5 pt-2 pb-1 font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase select-none',
    item: [
      'group flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-1.5 text-start text-foreground outline-none select-none',
      'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    itemIcon: 'shrink-0 text-muted-foreground group-data-highlighted:text-primary-text',
    itemText: 'flex min-w-0 flex-1 flex-col',
    itemLabel: 'truncate text-[13px]',
    itemDescription: 'truncate text-[11.5px] text-muted-foreground',
    itemArrow: 'shrink-0 text-muted-foreground opacity-0 group-data-highlighted:opacity-100',
    empty: 'px-4 py-10 text-center text-[13px] text-muted-foreground empty:hidden',
    footer: 'flex h-9 shrink-0 items-center gap-4 border-t border-border px-4 text-muted-foreground',
    hint: 'flex items-center gap-1.5 text-[11px]',
    count: 'ms-auto font-mono text-[10.5px]',
  },
  variants: {
    mono: { true: { itemLabel: 'font-mono text-[12.5px]' } },
  },
});

export type CommandPaletteVariantProps = VariantProps<typeof commandPaletteVariants>;
