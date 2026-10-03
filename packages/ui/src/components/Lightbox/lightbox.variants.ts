import { tv, type VariantProps } from '../../utils/tv';

const control = [
  'grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors motion-reduce:transition-none',
  'hover:bg-secondary/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  'disabled:pointer-events-none disabled:opacity-40',
];

export const lightboxVariants = tv({
  slots: {
    backdrop: 'fixed inset-0 z-50 bg-background/95 transition-opacity duration-200 motion-reduce:transition-none data-starting-style:opacity-0 data-ending-style:opacity-0',
    popup: [
      'fixed inset-0 z-50 flex flex-col text-foreground outline-none',
      'transition-opacity duration-200 motion-reduce:transition-none data-starting-style:opacity-0 data-ending-style:opacity-0',
    ],
    bar: 'flex shrink-0 items-center gap-1 border-b border-border/60 bg-chrome px-3 py-2',
    counter: 'me-auto font-mono text-[12px] text-muted-foreground tabular-nums',
    zoomValue: 'w-12 text-center font-mono text-[11.5px] text-muted-foreground tabular-nums',
    control,
    stageWrap: 'relative flex min-h-0 flex-1 items-stretch',
    stage: 'grid min-h-0 min-w-0 flex-1 place-items-center overflow-auto p-4 sm:px-16',
    media: 'w-auto max-w-full rounded-md object-contain shadow-md select-none',
    nav: [
      'absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors',
      'hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-40',
    ],
    prev: 'start-3',
    next: 'end-3',
    caption: 'shrink-0 px-4 pt-1 pb-3 text-center text-[13px] text-muted-foreground text-pretty',
    thumbs: 'flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-border/60 bg-chrome px-3 py-2.5',
    thumb: [
      'relative size-14 shrink-0 overflow-hidden rounded-md border border-border opacity-60 transition-opacity motion-reduce:transition-none',
      'hover:opacity-100 aria-[current=true]:border-primary aria-[current=true]:opacity-100',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    thumbImg: 'size-full object-cover',
    thumbBadge: 'absolute inset-0 grid place-items-center bg-background/40 text-foreground',
  },
});

export type LightboxVariantProps = VariantProps<typeof lightboxVariants>;
