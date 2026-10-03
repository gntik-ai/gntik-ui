import { tv, type VariantProps } from '../../utils/tv';

export const scrollAreaVariants = tv({
  slots: {
    root: 'relative min-h-0 overflow-hidden',
    viewport:
      'size-full overscroll-contain rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    content: '',
    scrollbar:
      'pointer-events-none flex touch-none p-0.5 opacity-0 transition-opacity duration-150 select-none motion-reduce:transition-none data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5',
    thumb: 'flex-1 rounded-full bg-border hover:bg-muted-foreground/50 active:bg-muted-foreground/60',
    corner: 'bg-transparent',
  },
  variants: {
    bordered: {
      true: { root: 'rounded-lg border border-border bg-card' },
    },
  },
  defaultVariants: { bordered: false },
});

export type ScrollAreaVariantProps = VariantProps<typeof scrollAreaVariants>;
