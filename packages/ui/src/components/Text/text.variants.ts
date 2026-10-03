import { tv, type VariantProps } from '../../utils/tv';

export const textVariants = tv({
  base: 'min-w-0',
  variants: {
    variant: {
      body: 'text-[0.9375rem] leading-relaxed',
      label: 'text-[13px] leading-tight font-medium',
      supporting: 'text-[13px] leading-snug',
      caption: 'text-[12px] leading-snug',
      code: 'rounded-sm bg-secondary px-1 py-0.5 font-mono text-[0.92em]',
      display: 'text-[2.875rem] leading-[1.04] font-bold tracking-tight',
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
      display: 'text-[2.875rem] leading-[1.04] font-bold tracking-tight',
      xl: 'text-[1.875rem] leading-tight font-bold tracking-tight',
      lg: 'text-[1.5rem] leading-snug font-bold tracking-tight',
      md: 'text-xl leading-snug font-semibold tracking-tight',
      sm: 'text-[17px] leading-snug font-semibold tracking-tight',
      xs: 'text-[15px] leading-snug font-semibold tracking-tight',
      '2xs': 'text-[13px] leading-snug font-semibold',
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
