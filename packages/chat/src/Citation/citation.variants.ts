import { focusRing } from '../utils/focus';

/** Slot classes for Citation and CitationList. */
export const citationStyles = {
  trigger: [
    'mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px cursor-pointer items-center justify-center rounded-md px-1',
    'bg-primary/14 align-baseline font-mono text-[10.5px] font-semibold leading-none text-primary-chip-text',
    `transition-colors hover:bg-primary/24 data-[popup-open]:bg-primary/24 motion-reduce:transition-none ${focusRing}`,
  ].join(' '),
  popup: 'w-80',
  head: 'flex items-center gap-2 text-[11.5px] text-muted-foreground',
  index: 'grid h-[18px] min-w-[18px] place-items-center rounded-md bg-secondary px-1 font-mono text-[10.5px] font-semibold text-foreground',
  title: 'mt-1.5 text-[13px] font-semibold leading-snug text-foreground',
  snippet: 'mt-1 line-clamp-4 text-[12.5px] leading-relaxed text-muted-foreground',
  open: `mt-2.5 inline-flex items-center gap-1 rounded-sm text-[12.5px] font-medium text-primary-text hover:underline ${focusRing}`,
  list: 'flex flex-col gap-1.5',
  heading: 'mb-1 text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase',
  item: 'flex gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5',
  itemBody: 'min-w-0 flex-1',
  itemTitle: `rounded-sm text-[13px] font-medium text-foreground hover:text-primary-text hover:underline ${focusRing}`,
  itemHost: 'mt-0.5 truncate font-mono text-[11px] text-muted-foreground',
} as const;
