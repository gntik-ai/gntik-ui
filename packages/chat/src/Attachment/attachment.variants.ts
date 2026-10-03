import { focusRing } from '../utils/focus';

/** Slot classes for AttachmentChip / AttachmentList. */
export const attachmentStyles = {
  list: 'flex flex-wrap gap-1.5',
  item: 'min-w-0',
  chip: [
    'relative inline-flex h-10 max-w-64 min-w-0 items-center gap-2 overflow-hidden rounded-md border border-border bg-secondary/50 ps-1.5 pe-1 text-[12px] text-foreground',
    'data-[status=error]:border-destructive/60 data-[status=error]:bg-destructive/8',
  ].join(' '),
  tile: [
    'relative flex w-28 flex-col overflow-hidden rounded-lg border border-border bg-card text-[12px] text-foreground',
    'data-[status=error]:border-destructive/60',
  ].join(' '),
  media: 'grid size-7 shrink-0 place-items-center overflow-hidden rounded bg-background text-muted-foreground',
  mediaError: 'text-destructive-text',
  tileMedia: 'grid aspect-square w-full place-items-center overflow-hidden bg-secondary/50 text-muted-foreground',
  img: 'size-full object-cover',
  text: 'flex min-w-0 flex-1 flex-col leading-4',
  tileText: 'flex min-w-0 flex-col gap-0.5 px-2 py-1.5 leading-4',
  name: 'truncate font-medium',
  meta: 'truncate font-mono text-[10.5px] text-muted-foreground',
  metaError: 'truncate text-[11px] text-destructive-chip-text',
  button: `grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  tileActions: 'absolute end-1 top-1 flex gap-0.5 rounded-md bg-card/90',
  track: 'absolute inset-x-0 bottom-0 h-0.5 bg-border',
  bar: 'h-full bg-primary transition-[width] duration-200 motion-reduce:transition-none',
  barIndeterminate: 'h-full w-1/3 bg-primary animate-pulse motion-reduce:animate-none',
} as const;
