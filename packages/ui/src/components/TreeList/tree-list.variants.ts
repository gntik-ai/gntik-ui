import { tv, type VariantProps } from '../../utils/tv';

export const treeListVariants = tv({
  slots: {
    root: 'm-0 list-none p-0 text-[13px] outline-none',
    group: 'm-0 list-none p-0',
    groupMotion: [
      'h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-(--duration-normal) ease-(--ease-standard) motion-reduce:transition-none',
      'data-starting-style:h-0 data-ending-style:h-0',
    ],
    item: [
      'outline-none',
      '[&:focus-visible>[data-row]]:outline-2 [&:focus-visible>[data-row]]:-outline-offset-2 [&:focus-visible>[data-row]]:outline-focus-ring',
    ],
    row: [
      'flex h-8 cursor-default items-center gap-1.5 rounded-md pe-2 text-foreground transition-colors select-none',
      'hover:bg-secondary/70',
    ],
    chevron:
      'grid size-4 shrink-0 place-items-center text-muted-foreground transition-transform duration-150 motion-reduce:transition-none rtl:-scale-x-100',
    icon: 'shrink-0 text-muted-foreground',
    label: 'min-w-0 flex-1 truncate text-start',
    meta: 'shrink-0 font-mono text-[11px] text-muted-foreground',
    check: 'grid size-4 shrink-0 place-items-center rounded-[4px] border border-border text-primary-foreground',
    status: 'flex h-8 items-center gap-2 pe-2 text-[12px] text-muted-foreground',
    empty: 'px-3 py-6 text-center text-[13px] text-muted-foreground',
  },
  variants: {
    selected: {
      true: {
        row: 'bg-primary/14 text-primary-chip-text hover:bg-primary/18',
        icon: 'text-primary-chip-text',
        check: 'border-primary bg-primary',
      },
    },
    expanded: { true: { chevron: 'rotate-90 rtl:-rotate-90' } },
    disabled: { true: { row: 'pointer-events-none opacity-50' } },
  },
});

export type TreeListVariantProps = VariantProps<typeof treeListVariants>;
