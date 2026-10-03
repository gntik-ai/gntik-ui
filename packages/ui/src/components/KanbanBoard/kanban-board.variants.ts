import { tv, type VariantProps } from '../../utils/tv';

/**
 * Kanban board: columns on a muted surface, cards as raised tiles. The drop target column and
 * the dragged card take the brand border; nothing animates under reduced motion.
 */
export const kanbanBoardVariants = tv({
  slots: {
    root: 'flex w-full items-start gap-3 overflow-x-auto pb-2',
    column: [
      'flex w-72 shrink-0 flex-col rounded-xl border border-border bg-secondary/40',
      'transition-colors duration-150 motion-reduce:transition-none',
      'data-over:border-primary/60 data-over:bg-accent/40',
    ],
    header: 'flex items-center justify-between gap-2 px-3 pt-3 pb-2',
    heading: 'flex min-w-0 items-center gap-2 text-[13px] font-semibold text-foreground',
    title: 'truncate',
    count: 'rounded-full bg-secondary px-2 py-px font-mono text-[11px] font-medium tabular-nums text-muted-foreground',
    list: 'flex min-h-16 flex-col gap-2 px-2 pb-2',
    item: 'list-none',
    card: [
      'block w-full cursor-grab select-none rounded-lg border border-border bg-card text-start text-foreground shadow-sm',
      'transition-[box-shadow,border-color] duration-150 motion-reduce:transition-none',
      'hover:border-primary/40',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-dragging:cursor-grabbing data-dragging:border-primary data-dragging:shadow-md',
    ],
    cardTitle: 'text-[13px] font-medium leading-5',
    cardDescription: 'mt-1 text-[12px] leading-5 text-muted-foreground',
    cardMeta: 'mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground',
    empty: 'list-none rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground',
  },
  variants: {
    size: {
      auto: { card: 'px-control py-cell' },
      sm: { card: 'px-2.5 py-2' },
      md: { card: 'px-3.5 py-3' },
    },
  },
  defaultVariants: { size: 'auto' },
});

export type KanbanBoardVariantProps = VariantProps<typeof kanbanBoardVariants>;
