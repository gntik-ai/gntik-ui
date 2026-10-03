import { tv, type VariantProps } from '../../utils/tv';

export const visuallyHiddenVariants = tv({
  base: 'sr-only',
  variants: {
    focusable: {
      true: 'focus:not-sr-only focus-within:not-sr-only',
    },
  },
  defaultVariants: { focusable: false },
});

export const skipLinkVariants = tv({
  base: [
    'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50',
    'focus:inline-flex focus:items-center focus:rounded-md focus:border focus:border-border focus:bg-card focus:px-3 focus:py-2',
    'focus:text-[13px] focus:font-medium focus:text-foreground focus:shadow-md',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  ],
});

export type VisuallyHiddenVariantProps = VariantProps<typeof visuallyHiddenVariants>;
