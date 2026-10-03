import { tv, type VariantProps } from '../../utils/tv';

export const aspectRatioVariants = tv({
  base: 'relative w-full overflow-hidden *:absolute *:inset-0 *:size-full [&>img]:object-cover [&>video]:object-cover',
  variants: {
    radius: {
      none: 'rounded-none',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    },
    surface: {
      true: 'border border-border bg-secondary',
    },
  },
  defaultVariants: { radius: 'lg', surface: false },
});

export type AspectRatioVariantProps = VariantProps<typeof aspectRatioVariants>;
