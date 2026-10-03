import { tv, type VariantProps } from '../../utils/tv';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

export const terminalVariants = tv({
  slots: {
    root: 'flex h-80 min-h-0 flex-col overflow-hidden rounded-md border border-border bg-card text-start',
    header: 'flex min-h-9 flex-wrap items-center justify-between gap-2 border-b border-border/70 py-1 pe-1.5 ps-3',
    title: 'min-w-0 truncate font-mono text-[11.5px] text-foreground',
    actions: 'ms-auto flex shrink-0 items-center gap-0.5',
    search: [
      'flex h-7 items-center gap-1.5 rounded-md border border-border bg-background pe-1 ps-2 text-muted-foreground',
      'focus-within:border-primary/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
    ],
    searchInput: 'w-32 min-w-0 bg-transparent font-mono text-[11.5px] text-foreground outline-none placeholder:text-muted-foreground',
    matches: 'shrink-0 font-mono text-[10.5px] text-muted-foreground tabular-nums',
    button: [
      'inline-flex h-7 min-w-7 cursor-pointer items-center justify-center gap-1.5 rounded-md px-1.5 font-mono text-[11px] text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary hover:text-foreground aria-pressed:bg-secondary aria-pressed:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
      focus,
    ],
    copied: 'text-primary-text hover:text-primary-text',
    body: 'relative min-h-0 flex-1',
    viewport: [
      'h-full overflow-auto bg-background/40 py-2 font-mono text-[12px] leading-[1.6] text-foreground',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    ],
    lines: 'grid',
    line: 'flex pe-3 ps-3 data-current:bg-primary/10',
    lineNumber: 'me-3 inline-block shrink-0 text-end text-muted-foreground tabular-nums select-none',
    timestamp: 'me-3 shrink-0 text-muted-foreground tabular-nums select-none',
    content: 'min-w-0 flex-1',
    mark: 'rounded-[2px] bg-warning/25 text-foreground data-current:bg-warning/50 data-current:outline-1 data-current:outline-warning',
    empty: 'px-3 py-2 font-mono text-[12px] text-muted-foreground',
    jump: [
      'absolute bottom-3 start-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-popover px-3 py-1 text-[12px] font-medium text-popover-foreground shadow-md',
      'rtl:translate-x-1/2 transition-colors hover:bg-secondary motion-reduce:transition-none',
      focus,
    ],
  },
  variants: {
    wrap: {
      true: { lines: 'w-full', content: 'break-words whitespace-pre-wrap' },
      false: { lines: 'w-max min-w-full', content: 'whitespace-pre' },
    },
  },
  defaultVariants: { wrap: false },
});

export type TerminalVariantProps = VariantProps<typeof terminalVariants>;
