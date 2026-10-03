import { tv, type VariantProps } from '../../utils/tv';

export const avatarVariants = tv({
  slots: {
    wrapper: 'relative inline-flex shrink-0 align-middle',
    root: 'relative inline-flex size-full items-center justify-center overflow-hidden font-bold tracking-tight select-none',
    image: 'absolute inset-0 size-full object-cover data-[error]:invisible data-[loading]:invisible',
    fallback: 'absolute inset-0 grid place-items-center leading-none',
    status: 'absolute -end-0.5 -bottom-0.5 rounded-full ring-2 ring-card',
    overflow: 'relative inline-flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-muted-foreground ring-2 ring-card',
  },
  variants: {
    size: {
      xs: { wrapper: 'size-6', root: 'text-[10px]', status: 'size-2', overflow: 'size-6 text-[10px]' },
      sm: { wrapper: 'size-8', root: 'text-[11px]', status: 'size-2.5', overflow: 'size-8 text-[11px]' },
      md: { wrapper: 'size-10', root: 'text-[13px]', status: 'size-3', overflow: 'size-10 text-[13px]' },
      lg: { wrapper: 'size-12', root: 'text-[15px]', status: 'size-3.5', overflow: 'size-12 text-[15px]' },
      xl: { wrapper: 'size-16', root: 'text-[20px]', status: 'size-4', overflow: 'size-16 text-[20px]' },
    },
    shape: {
      round: { root: 'rounded-full' },
      rounded: {},
    },
    tone: {
      primary: { root: 'bg-primary text-primary-foreground' },
      accent: { root: 'bg-accent text-accent-foreground' },
      secondary: { root: 'bg-secondary text-secondary-foreground' },
      violet: { root: 'bg-category-violet/20 text-foreground' },
      cyan: { root: 'bg-category-cyan/18 text-foreground' },
      amber: { root: 'bg-category-amber/22 text-foreground' },
      rose: { root: 'bg-category-rose/18 text-foreground' },
    },
    status: {
      online: { status: 'bg-success' },
      idle: { status: 'bg-warning' },
      busy: { status: 'bg-destructive' },
      offline: { status: 'bg-muted-foreground' },
    },
    ring: { true: { root: 'ring-2 ring-card' } },
  },
  compoundVariants: [
    { shape: 'rounded', size: 'xs', class: { root: 'rounded-md' } },
    { shape: 'rounded', size: 'sm', class: { root: 'rounded-lg' } },
    { shape: 'rounded', size: 'md', class: { root: 'rounded-[10px]' } },
    { shape: 'rounded', size: 'lg', class: { root: 'rounded-xl' } },
    { shape: 'rounded', size: 'xl', class: { root: 'rounded-2xl' } },
  ],
  defaultVariants: { size: 'md', shape: 'round', tone: 'primary' },
});

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;
export type AvatarSize = NonNullable<AvatarVariantProps['size']>;
export type AvatarStatus = NonNullable<AvatarVariantProps['status']>;
