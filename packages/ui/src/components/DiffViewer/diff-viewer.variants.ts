import { tv, type VariantProps } from '../../utils/tv';

/** Line styling never relies on colour alone: every changed line also has a +/− marker and screen-reader text. */
export const diffViewerVariants = tv({
  slots: {
    root: 'flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground',
    header: 'flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2',
    labels: 'flex min-w-0 flex-1 items-center gap-2 font-mono text-[12px] text-muted-foreground',
    label: 'truncate text-foreground',
    arrow: 'shrink-0 rtl:-scale-x-100',
    stats: 'flex shrink-0 items-center gap-2 font-mono text-[12px] font-medium',
    statAdded: 'text-success-text',
    statRemoved: 'text-destructive-text',
    columns: 'grid grid-cols-2 border-b border-border font-mono text-[11.5px] text-muted-foreground',
    column: 'truncate px-3 py-1.5 first:border-e first:border-border',
    body: 'overflow-auto font-mono text-[12px] leading-5 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    row: 'grid min-w-0',
    unifiedRow: 'grid-cols-[auto_auto_1.25rem_minmax(0,1fr)]',
    splitRow: 'grid-cols-2',
    half: 'grid min-w-0 grid-cols-[auto_1.25rem_minmax(0,1fr)] first:border-e first:border-border',
    number: 'px-2 text-end text-muted-foreground tabular-nums select-none',
    marker: 'text-center select-none',
    code: 'min-w-0 pe-3 break-words whitespace-pre-wrap',
    word: 'rounded-sm',
    empty: 'bg-secondary/40',
    collapsed: 'flex items-center border-y border-border bg-secondary/40 px-1 py-0.5',
    noChanges: 'px-3 py-2 font-sans text-[12.5px] text-muted-foreground',
  },
  variants: {
    type: {
      unchanged: {},
      added: { row: 'bg-success/10', half: 'bg-success/10', number: 'bg-success/15', marker: 'text-success-text', word: 'bg-success/30' },
      removed: { row: 'bg-destructive/10', half: 'bg-destructive/10', number: 'bg-destructive/15', marker: 'text-destructive-text', word: 'bg-destructive/30' },
    },
  },
  defaultVariants: { type: 'unchanged' },
});

export type DiffViewerVariantProps = VariantProps<typeof diffViewerVariants>;
