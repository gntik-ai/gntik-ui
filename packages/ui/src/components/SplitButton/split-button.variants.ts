import { tv, type VariantProps } from '../../utils/tv';

/**
 * Two joined Buttons: the primary action keeps its start corners, the menu button its end
 * corners, and a token-coloured divider separates them for every Button variant.
 */
export const splitButtonVariants = tv({
  slots: {
    root: 'inline-flex shrink-0 items-stretch',
    action: 'rounded-e-none focus-visible:z-10',
    trigger: 'rounded-s-none focus-visible:z-10 data-popup-open:bg-secondary/70',
    chevron: 'transition-transform duration-150 motion-reduce:transition-none in-data-popup-open:rotate-180',
  },
  variants: {
    variant: {
      primary: { trigger: 'border-s border-primary-foreground/25 data-popup-open:bg-primary/90' },
      secondary: { trigger: '-ms-px' },
      soft: { trigger: 'border-s border-primary/25 data-popup-open:bg-primary/20' },
      ghost: { trigger: 'border-s border-border' },
      destructive: { trigger: 'border-s border-destructive-foreground/25 data-popup-open:bg-destructive/90' },
    },
  },
  defaultVariants: { variant: 'primary' },
});

export type SplitButtonVariantProps = VariantProps<typeof splitButtonVariants>;
