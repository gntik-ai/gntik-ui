import { tv, type VariantProps } from '../../utils/tv';

export const transferListVariants = tv({
  slots: {
    root: 'grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
    pane: 'flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
    paneHead: 'flex items-center gap-2 border-b border-border px-3 py-2.5',
    paneTitle: 'min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground',
    paneCount: 'shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums',
    search: 'border-b border-border p-2',
    listbox: [
      'min-h-0 flex-1 overflow-y-auto p-1 outline-none',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    ],
    option: [
      'flex cursor-default items-start gap-2.5 rounded-[6px] px-2 py-1.5 text-[13px] text-foreground select-none',
      'hover:bg-secondary/50 data-active:bg-secondary/70 aria-selected:bg-primary/12 aria-selected:data-active:bg-primary/16',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-45',
    ],
    check: [
      'mt-0.5 grid size-4 shrink-0 place-items-center rounded-[4px] border border-border bg-background text-primary-foreground',
      'group-aria-selected/option:border-primary group-aria-selected/option:bg-primary',
    ],
    optionText: 'flex min-w-0 flex-col',
    optionLabel: 'truncate',
    optionDescription: 'truncate text-[11.5px] text-muted-foreground',
    empty: 'grid place-items-center px-3 py-6 text-center text-[12.5px] text-muted-foreground',
    paneFoot: 'flex items-center gap-1 border-t border-border px-2 py-1.5',
    footHint: 'ms-1 min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground',
    actions: 'flex flex-row items-center justify-center gap-1.5 sm:flex-col',
  },
});

export type TransferListVariantProps = VariantProps<typeof transferListVariants>;
