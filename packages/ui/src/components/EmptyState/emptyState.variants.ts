import { tv, type VariantProps } from '../../utils/tv';

export const emptyStateVariants = tv({
  slots: {
    root: 'mx-auto flex w-full flex-col items-center justify-center text-center',
    icon: 'grid place-items-center bg-secondary/70 text-muted-foreground ring-1 ring-border',
    title: 'font-semibold tracking-tight text-foreground',
    description: 'text-muted-foreground',
    actions: 'flex flex-wrap items-center justify-center gap-2',
  },
  variants: {
    size: {
      sm: { root: 'max-w-sm px-4 py-6', icon: 'size-10 rounded-xl', title: 'mt-3 text-[14px]', description: 'mt-1 text-[12.5px] leading-5', actions: 'mt-4' },
      md: { root: 'max-w-md px-6 py-10', icon: 'size-12 rounded-2xl', title: 'mt-4 text-[15px]', description: 'mt-1.5 text-[13px] leading-6', actions: 'mt-5' },
      lg: { root: 'max-w-lg px-6 py-16', icon: 'size-14 rounded-2xl', title: 'mt-5 text-[17px]', description: 'mt-2 text-[14px] leading-6', actions: 'mt-6' },
    },
    bordered: {
      true: { root: 'max-w-none rounded-lg border border-dashed border-border' },
    },
  },
  defaultVariants: { size: 'md', bordered: false },
});

export type EmptyStateVariantProps = VariantProps<typeof emptyStateVariants>;

/** Icon size (px) per empty-state size. */
export const EMPTY_STATE_ICON_SIZE = { sm: 18, md: 22, lg: 26 } as const;
