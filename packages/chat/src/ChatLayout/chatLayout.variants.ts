import { focusRing } from '../utils/focus';

/** Slot classes for ChatLayout (plain strings: this package does not ship tailwind-variants). */
export const chatLayoutStyles = {
  root: 'flex h-full min-h-0 w-full bg-background text-foreground',
  thread: 'flex min-w-0 flex-1 flex-col',
  header: 'shrink-0 border-b border-border',
  viewport: 'relative min-h-0 flex-1',
  scroller: `h-full overflow-y-auto overscroll-contain ${focusRing} focus-visible:-outline-offset-2`,
  content: 'mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6',
  jump: 'pointer-events-none absolute inset-x-0 bottom-3 flex justify-center',
  jumpButton: 'pointer-events-auto rounded-full shadow-md',
  composer: 'shrink-0 bg-background px-4 pb-4 pt-2 sm:px-6',
  composerInner: 'mx-auto w-full max-w-3xl',
  handle: [
    'group relative w-1.5 shrink-0 cursor-col-resize touch-none bg-transparent',
    'after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-border',
    'hover:after:w-0.5 hover:after:bg-primary/60 data-[dragging]:after:w-0.5 data-[dragging]:after:bg-primary',
    'focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus-ring',
  ].join(' '),
  panel: 'flex min-h-0 shrink-0 flex-col overflow-hidden border-s border-border bg-card',
} as const;
