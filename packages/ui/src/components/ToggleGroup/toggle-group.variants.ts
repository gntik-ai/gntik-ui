import { tv, type VariantProps } from '../../utils/tv';

export const toggleGroupVariants = tv({
  base: 'inline-flex data-[orientation=vertical]:flex-col data-disabled:opacity-50',
  variants: {
    variant: {
      /** Pill container; the pressed item lifts onto bg-secondary. */
      segmented: 'items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 shadow-sm',
      /** Buttons sharing borders; rounding only on the container. */
      joined: 'overflow-hidden rounded-lg border border-border bg-card shadow-sm divide-x divide-border data-[orientation=vertical]:divide-x-0 data-[orientation=vertical]:divide-y',
    },
  },
  defaultVariants: { variant: 'segmented' },
});

export const toggleVariants = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap text-muted-foreground transition-colors select-none',
    'hover:text-foreground data-pressed:bg-secondary data-pressed:text-foreground',
    'focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:text-muted-foreground',
  ],
  variants: {
    variant: {
      /** Standalone pressed button. */
      standalone: 'rounded-lg border border-border bg-card shadow-sm hover:bg-secondary/50 data-pressed:border-primary/40',
      segmented: 'rounded-md data-pressed:shadow-sm',
      joined: 'hover:bg-secondary/50',
    },
    size: {
      sm: 'h-8 px-3 text-[12.5px]',
      md: 'h-9 px-4 text-[13px]',
    },
    iconOnly: { true: 'px-0' },
  },
  compoundVariants: [
    { variant: 'segmented', size: 'md', class: 'h-8 px-3 text-[12.5px]' },
    { variant: 'segmented', size: 'sm', class: 'h-7 px-2.5 text-[12px]' },
    { iconOnly: true, size: 'sm', class: 'size-8 px-0' },
    { iconOnly: true, size: 'md', class: 'size-9 px-0' },
    { iconOnly: true, variant: 'segmented', size: 'md', class: 'size-8' },
    { iconOnly: true, variant: 'segmented', size: 'sm', class: 'size-7' },
  ],
  defaultVariants: { variant: 'standalone', size: 'md', iconOnly: false },
});

export type ToggleGroupVariantProps = VariantProps<typeof toggleGroupVariants>;
export type ToggleVariantProps = VariantProps<typeof toggleVariants>;
