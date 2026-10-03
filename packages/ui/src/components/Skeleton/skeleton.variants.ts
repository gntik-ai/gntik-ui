import { tv, type VariantProps } from '../../utils/tv';

export const skeletonVariants = tv({
  slots: {
    block: 'animate-pulse bg-muted motion-reduce:animate-none',
    lines: 'grid gap-2',
  },
  variants: {
    shape: {
      block: { block: 'h-4 w-full rounded-md' },
      text: { block: 'h-3 w-full rounded-md' },
      circle: { block: 'size-10 shrink-0 rounded-full' },
    },
  },
  defaultVariants: { shape: 'block' },
});

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;
