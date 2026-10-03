import { tv, type VariantProps } from '../../utils/tv';

export const virtualListVariants = tv({
  slots: {
    viewport: 'relative min-h-0 overflow-y-auto overscroll-contain rounded-lg border border-border bg-card outline-none',
    spacer: 'relative w-full',
    row: [
      'absolute inset-x-0 top-0 flex items-center outline-none',
      'focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    ],
    option: 'cursor-default data-active:bg-secondary/60 aria-selected:bg-primary/12 aria-selected:data-active:bg-primary/16',
    empty: 'grid h-full place-items-center px-4 py-8 text-[12.5px] text-muted-foreground',
  },
  variants: {
    divided: { true: { row: 'border-b border-border/60' } },
  },
  defaultVariants: { divided: true },
});

export type VirtualListVariantProps = VariantProps<typeof virtualListVariants>;
