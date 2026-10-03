/** Slot classes for ToolCallCard and JsonView. */
export const toolCallCardStyles = {
  root: 'w-full overflow-hidden rounded-lg border border-border bg-card text-[13px]',
  trigger: [
    'flex h-auto w-full min-w-0 justify-start gap-2.5 rounded-none px-3 py-2.5 text-left hover:bg-secondary/50',
    'focus-visible:-outline-offset-2',
  ].join(' '),
  icon: 'grid size-6 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground',
  iconFailed: 'bg-destructive/15 text-destructive-text',
  label: 'flex min-w-0 flex-1 items-baseline gap-1.5',
  verb: 'shrink-0 text-muted-foreground',
  name: 'truncate font-mono text-[12.5px] font-semibold text-foreground',
  meta: 'flex shrink-0 items-center gap-2',
  duration: 'font-mono text-[11px] text-muted-foreground tabular-nums',
  body: 'flex flex-col gap-2 border-t border-border px-3 pb-3 pt-1',
  error: 'rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive-text',
  json: {
    trigger: 'mx-0 h-7 px-1 text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase',
    content: 'pt-1',
    pre: 'max-h-64 overflow-auto rounded-md border border-border bg-secondary/40 p-2.5 font-mono text-[12px] leading-5 text-foreground',
  },
} as const;
