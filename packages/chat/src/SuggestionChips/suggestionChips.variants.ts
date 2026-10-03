import { focusRing } from '../utils/focus';

/** Slot classes for SuggestionChips. */
export const suggestionChipsStyles = {
  root: 'w-full',
  heading: 'mb-2.5 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase',
  grid: 'grid gap-2 sm:grid-cols-2',
  row: 'flex flex-wrap gap-2',
  card: [
    'group flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 text-start shadow-sm',
    'transition-colors hover:border-primary/40 hover:bg-secondary/40 motion-reduce:transition-none',
    'disabled:pointer-events-none disabled:opacity-50',
    focusRing,
  ].join(' '),
  chip: [
    'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12.5px] font-medium text-foreground',
    'transition-colors hover:border-primary/40 hover:bg-secondary/40 motion-reduce:transition-none',
    'disabled:pointer-events-none disabled:opacity-50',
    focusRing,
  ].join(' '),
  icon: 'mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary-text',
  label: 'block text-[13px] font-medium text-foreground',
  description: 'mt-0.5 block text-[12px] leading-5 text-muted-foreground',
} as const;
