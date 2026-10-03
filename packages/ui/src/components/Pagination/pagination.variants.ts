import { tv, type VariantProps } from '../../utils/tv';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

export const paginationVariants = tv({
  slots: {
    root: 'flex items-center',
    list: 'flex items-center gap-1.5',
    page: [
      'grid cursor-pointer place-items-center rounded-lg font-medium tabular-nums transition-colors',
      'text-muted-foreground hover:bg-secondary hover:text-foreground',
      'aria-[current=page]:bg-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary-foreground aria-[current=page]:hover:bg-primary/90',
      focusRing,
    ],
    arrow: [
      'grid cursor-pointer place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors',
      'hover:border-ring/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
      focusRing,
    ],
    ellipsis: 'grid place-items-center text-muted-foreground/50',
    summary: 'text-[12.5px] text-muted-foreground tabular-nums',
    summaryValue: 'font-mono text-foreground',
  },
  variants: {
    size: {
      sm: { page: 'size-8 text-[12.5px]', arrow: 'size-8', ellipsis: 'size-8' },
      md: { page: 'size-9 text-[13px]', arrow: 'size-9', ellipsis: 'size-9' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type PaginationVariantProps = VariantProps<typeof paginationVariants>;
