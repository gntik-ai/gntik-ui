import { tv, type VariantProps } from '../../utils/tv';

export const switchVariants = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 cursor-pointer items-center rounded-full bg-secondary transition-colors',
      'data-checked:bg-primary',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    thumb: 'pointer-events-none ml-[2px] grid place-items-center rounded-full bg-background shadow-sm transition-transform motion-reduce:transition-none',
    label: 'inline-flex items-center gap-2.5 text-[13px] text-foreground',
  },
  variants: {
    size: {
      sm: { root: 'h-[18px] w-8', thumb: 'size-3.5 data-checked:translate-x-[14px]' },
      md: { root: 'h-[22px] w-[40px]', thumb: 'size-[18px] data-checked:translate-x-[18px]' },
      lg: { root: 'h-[26px] w-[46px]', thumb: 'size-[22px] data-checked:translate-x-[20px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type SwitchVariantProps = VariantProps<typeof switchVariants>;
