import { tv, type VariantProps } from '../../utils/tv';

export const resizableVariants = tv({
  slots: {
    group: 'flex size-full min-h-0 min-w-0 overflow-hidden',
    panel: 'min-h-0 min-w-0',
    handle: [
      'relative z-10 flex shrink-0 touch-none items-center justify-center bg-border select-none',
      'transition-colors duration-150 motion-reduce:transition-none',
      'hover:bg-primary/60 data-dragging:bg-primary focus-visible:bg-primary',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      "after:absolute after:content-['']",
      'data-disabled:pointer-events-none data-disabled:bg-border',
    ],
    grip: 'flex items-center justify-center rounded-sm border border-border bg-card text-muted-foreground shadow-sm',
  },
  variants: {
    direction: {
      horizontal: {
        group: 'flex-row',
        handle: 'w-px cursor-col-resize after:inset-y-0 after:-inset-x-1.5',
        grip: 'h-6 w-3.5',
      },
      vertical: {
        group: 'flex-col',
        handle: 'h-px cursor-row-resize after:inset-x-0 after:-inset-y-1.5',
        grip: 'h-3.5 w-6',
      },
    },
  },
  defaultVariants: { direction: 'horizontal' },
});

export type ResizableVariantProps = VariantProps<typeof resizableVariants>;
