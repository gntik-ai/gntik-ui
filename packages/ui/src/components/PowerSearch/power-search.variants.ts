import { tv, type VariantProps } from '../../utils/tv';
import { listboxItem, listboxPopup } from '../Select/select.variants';

export const powerSearchVariants = tv({
  slots: {
    root: [
      'flex w-full min-w-0 cursor-text flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-foreground shadow-sm transition-colors motion-reduce:transition-none',
      'has-[input:focus-visible]:border-primary/60 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
      'data-disabled:cursor-not-allowed data-disabled:bg-secondary/50',
    ],
    icon: 'ms-1 shrink-0 text-muted-foreground',
    terms: 'contents',
    chip: [
      'group/chip inline-flex h-6 max-w-full items-center rounded border border-transparent bg-primary/14 font-mono text-[11.5px] text-primary-chip-text',
      'has-[button[data-chip-body]:focus-visible]:outline-2 has-[button[data-chip-body]:focus-visible]:outline-offset-1 has-[button[data-chip-body]:focus-visible]:outline-focus-ring',
    ],
    chipText: 'bg-secondary text-foreground',
    chipBody: 'flex h-full min-w-0 items-center gap-1 truncate ps-2 pe-1 outline-none',
    chipField: 'font-semibold',
    chipOp: 'opacity-75',
    chipRemove: 'me-0.5 grid size-4 shrink-0 place-items-center rounded transition-colors hover:bg-primary/20 motion-reduce:transition-none',
    draft: 'inline-flex h-6 items-center gap-1 rounded border border-dashed border-primary/50 px-1.5 font-mono text-[11.5px] text-primary-text',
    input: 'h-6 min-w-32 flex-1 bg-transparent px-1 text-[13px] text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
    clear: [
      'ms-auto grid size-6 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-focus-ring',
    ],
    positioner: 'z-50 outline-none',
    popup: [...listboxPopup, 'min-w-64'],
    group: 'px-2.5 pt-1.5 pb-1 font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase',
    item: listboxItem,
    itemMain: 'flex min-w-0 items-baseline gap-2',
    itemCode: 'shrink-0 font-mono text-[12px] text-foreground',
    itemHint: 'truncate text-[11.5px] text-muted-foreground',
    empty: 'px-2.5 py-2 text-[12px] text-muted-foreground empty:hidden',
  },
});

export type PowerSearchVariantProps = VariantProps<typeof powerSearchVariants>;
