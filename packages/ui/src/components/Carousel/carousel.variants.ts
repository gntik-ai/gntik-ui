import { tv, type VariantProps } from '../../utils/tv';

const control = [
  'grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors motion-reduce:transition-none',
  'hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  'disabled:pointer-events-none disabled:opacity-45',
];

export const carouselVariants = tv({
  slots: {
    root: 'relative flex min-w-0 flex-col gap-3',
    header: 'flex min-w-0 items-center gap-2',
    title: 'min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight text-foreground',
    controls: 'ms-auto flex shrink-0 items-center gap-1.5',
    control,
    viewport: [
      'flex min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth motion-reduce:scroll-auto',
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      'rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
    slide: 'min-w-0 shrink-0 snap-start',
    dots: 'flex items-center justify-center gap-1.5',
    dot: [
      'h-1.5 w-1.5 rounded-full bg-border transition-[width,background-color] motion-reduce:transition-none',
      'hover:bg-muted-foreground aria-[current=true]:w-4 aria-[current=true]:bg-primary',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    ],
  },
  variants: {
    perView: {
      1: { slide: 'basis-full' },
      2: { slide: 'basis-full sm:basis-[calc((100%-var(--carousel-gap))/2)]' },
      3: { slide: 'basis-full sm:basis-[calc((100%-var(--carousel-gap))/2)] lg:basis-[calc((100%-2*var(--carousel-gap))/3)]' },
      auto: { slide: 'basis-auto' },
    },
  },
  defaultVariants: { perView: 1 },
});

export type CarouselVariantProps = VariantProps<typeof carouselVariants>;
