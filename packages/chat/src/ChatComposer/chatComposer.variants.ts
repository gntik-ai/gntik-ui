import { focusRing } from '../utils/focus';

/** Slot classes for ChatComposer (focus ring on the frame, like the legacy composer). */
export const chatComposerStyles = {
  root: [
    'overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors motion-reduce:transition-none',
    'focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25',
    'data-[disabled]:opacity-60',
  ].join(' '),
  attachments: 'flex flex-wrap gap-1.5 px-3 pt-3',
  chip: 'inline-flex h-7 max-w-60 items-center gap-1.5 rounded-md border border-border bg-secondary/50 pl-2 pr-1 text-[12px] text-foreground',
  chipName: 'truncate font-medium',
  chipSize: 'shrink-0 font-mono text-[10.5px] text-muted-foreground',
  chipRemove: `grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground ${focusRing}`,
  textarea: [
    'block max-h-[220px] min-h-[52px] w-full resize-none bg-transparent px-3.5 py-3 text-[14px] leading-6 text-foreground',
    'field-sizing-content placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed',
  ].join(' '),
  toolbar: 'flex items-center justify-between gap-2 px-2 pb-2',
  tools: 'flex min-w-0 items-center gap-1',
  end: 'flex shrink-0 items-center gap-2',
  count: 'font-mono text-[11px] text-muted-foreground tabular-nums',
  countOver: 'text-destructive-text',
  hint: 'mt-1.5 px-1 text-center text-[11.5px] text-muted-foreground',
} as const;
