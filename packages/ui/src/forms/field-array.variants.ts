import { tv } from '../utils/tv';

export const fieldArrayVariants = tv({
  slots: {
    root: 'min-w-0',
    list: 'flex flex-col gap-3',
    row: 'flex min-w-0 gap-3',
    fields: 'flex min-w-0 flex-1 flex-col gap-3',
    actions: 'flex shrink-0 flex-wrap items-start gap-1',
    footer: 'flex flex-wrap items-center gap-3',
    hint: 'text-sm text-muted-foreground',
    error: 'text-sm text-destructive-text',
  },
  variants: {
    layout: {
      inline: { row: 'flex-col sm:flex-row' },
      card: { row: 'flex-col rounded-lg border border-border bg-card p-4' },
    },
  },
  defaultVariants: { layout: 'inline' },
});
