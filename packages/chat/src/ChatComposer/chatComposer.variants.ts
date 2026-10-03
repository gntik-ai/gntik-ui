import { focusRing } from '../utils/focus';

/** Slot classes for ChatComposer (focus ring on the frame, like the legacy composer). */
export const chatComposerStyles = {
  root: [
    'relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors motion-reduce:transition-none',
    'focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25',
    'data-[disabled]:opacity-60 data-[dragging]:border-primary/60',
  ].join(' '),
  dropOverlay:
    'pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-card/95 text-[13px] font-medium text-primary-text',
  errors: 'mx-3 mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/8 px-2.5 py-1.5 text-[12px] text-destructive-chip-text',
  errorList: 'flex min-w-0 flex-1 flex-col gap-0.5',
  errorDismiss: `-me-1 grid size-5 shrink-0 place-items-center rounded text-destructive-chip-text hover:bg-foreground/10 ${focusRing}`,
  attachments: 'flex flex-wrap gap-1.5 px-3 pt-3',
  /** @deprecated Chips render AttachmentChip (see attachmentStyles). */
  chip: 'inline-flex h-7 max-w-60 items-center gap-1.5 rounded-md border border-border bg-secondary/50 ps-2 pe-1 text-[12px] text-foreground',
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
