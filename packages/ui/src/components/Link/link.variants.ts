import { tv, type VariantProps } from '../../utils/tv';

export const linkVariants = tv({
  slots: {
    root: [
      'cursor-pointer rounded-sm font-medium underline-offset-4 transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    ],
    externalIcon: 'ms-1 inline-block shrink-0 align-[-0.125em]',
  },
  variants: {
    tone: {
      primary: { root: 'text-primary-text' },
      muted: { root: 'text-muted-foreground hover:text-foreground' },
      inherit: { root: 'text-inherit' },
    },
    underline: {
      hover: { root: 'no-underline hover:underline' },
      always: { root: 'underline decoration-current/40 hover:decoration-current' },
      none: { root: 'no-underline' },
    },
  },
  // Inline links are underlined by default (WCAG 1.4.1: not by colour alone); standalone links opt out.
  defaultVariants: { tone: 'primary', underline: 'always' },
});

export type LinkVariantProps = VariantProps<typeof linkVariants>;
