import { tv, type VariantProps } from '../../utils/tv';

export const buttonVariants = tv({
  base: 'inline-flex items-center gap-2 rounded-md text-sm font-medium',
  variants: {
    variant: { primary: 'bg-primary text-primary-foreground', ghost: 'hover:bg-accent' },
    size: { sm: 'h-8 px-3', md: 'h-9 px-4', icon: 'size-9' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
