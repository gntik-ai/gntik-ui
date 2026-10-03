import { tv, type VariantProps } from '../../utils/tv';

export const buttonVariants = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      secondary: 'border border-border bg-card text-foreground shadow-sm hover:bg-secondary/70',
      soft: 'bg-primary/14 text-primary-chip-text hover:bg-primary/20',
      ghost: 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    },
    size: {
      sm: 'h-8 gap-1.5 px-3 text-[12.5px] rounded-md',
      md: 'h-9 gap-1.5 px-3.5 text-[13px] rounded-lg',
      lg: 'h-11 gap-2 px-5 text-[14.5px] rounded-lg',
    },
    iconOnly: { true: 'px-0' },
  },
  compoundVariants: [
    { iconOnly: true, size: 'sm', class: 'size-8' },
    { iconOnly: true, size: 'md', class: 'size-9' },
    { iconOnly: true, size: 'lg', class: 'size-11' },
  ],
  defaultVariants: { variant: 'primary', size: 'md', iconOnly: false },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/** Icon size (px) per button size. */
export const BUTTON_ICON_SIZE = { sm: 14, md: 15, lg: 17 } as const;
