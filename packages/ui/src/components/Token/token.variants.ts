import { tv, type VariantProps } from '../../utils/tv';

export const tokenVariants = tv({
  slots: {
    root: [
      'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-md border align-middle whitespace-nowrap select-none',
      'data-disabled:opacity-60',
    ],
    leading: 'inline-flex shrink-0 items-center [&_svg]:shrink-0',
    label: 'min-w-0 truncate font-medium',
    remove: [
      'grid shrink-0 cursor-pointer place-items-center rounded text-muted-foreground transition-colors motion-reduce:transition-none',
      'hover:bg-secondary hover:text-foreground',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
      'disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground',
    ],
  },
  variants: {
    tone: {
      neutral: { root: 'border-border bg-background text-foreground', leading: 'text-muted-foreground' },
      primary: { root: 'border-primary/35 bg-primary/10 text-primary-chip-text', leading: 'text-primary-text' },
      success: { root: 'border-success/35 bg-success/10 text-success-chip-text', leading: 'text-success-text' },
      warning: { root: 'border-warning/40 bg-warning/12 text-warning-chip-text', leading: 'text-warning-text' },
      destructive: { root: 'border-destructive/35 bg-destructive/10 text-destructive-chip-text', leading: 'text-destructive-text' },
    },
    size: {
      sm: { root: 'h-6 ps-2 text-[11.5px]', remove: 'size-4', label: 'max-w-[120px]' },
      md: { root: 'h-7 ps-2.5 text-[12px]', remove: 'size-5', label: 'max-w-[160px]' },
    },
    removable: {
      true: { root: 'pe-1' },
      false: {},
    },
  },
  compoundVariants: [
    { removable: false, size: 'sm', class: { root: 'pe-2' } },
    { removable: false, size: 'md', class: { root: 'pe-2.5' } },
  ],
  defaultVariants: { tone: 'neutral', size: 'md', removable: false },
});

export type TokenVariantProps = VariantProps<typeof tokenVariants>;
export type TokenTone = NonNullable<TokenVariantProps['tone']>;
