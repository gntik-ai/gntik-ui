import { tv, type VariantProps } from '../../utils/tv';

export const textVariants = tv({
  base: 'min-w-0',
  variants: {
    variant: {
      body: 'text-body',
      label: 'text-label',
      supporting: 'text-supporting',
      caption: 'text-caption',
      code: 'rounded-sm bg-secondary px-1 py-0.5 font-mono text-[0.92em]',
      display: 'text-display',
    },
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary-text',
      success: 'text-success-text',
      warning: 'text-warning-text',
      destructive: 'text-destructive-text',
      inherit: 'text-inherit',
    },
    truncate: { true: 'truncate' },
    lineClamp: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
      5: 'line-clamp-5',
      6: 'line-clamp-6',
    },
  },
  defaultVariants: { variant: 'body' },
});

export const headingVariants = tv({
  base: 'min-w-0 text-balance',
  variants: {
    size: {
      display: 'text-display',
      xl: 'text-heading-xl',
      lg: 'text-heading-lg',
      md: 'text-heading-md',
      sm: 'text-heading-sm',
      xs: 'text-heading-xs',
      '2xs': 'text-heading-2xs',
    },
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary-text',
      inherit: 'text-inherit',
    },
    truncate: { true: 'truncate' },
    lineClamp: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
    },
  },
  defaultVariants: { tone: 'default' },
});

export type TextVariantProps = VariantProps<typeof textVariants>;
export type HeadingVariantProps = VariantProps<typeof headingVariants>;
