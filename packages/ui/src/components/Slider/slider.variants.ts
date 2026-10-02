import { tv, type VariantProps } from '../../utils/tv';

export const sliderVariants = tv({
  slots: {
    root: 'flex w-full flex-col gap-2 data-disabled:opacity-50',
    header: 'flex items-baseline justify-between gap-3',
    label: 'text-[13px] font-medium text-foreground',
    value: 'font-mono text-[12px] text-muted-foreground tabular-nums',
    control: 'flex w-full touch-none items-center select-none data-disabled:cursor-not-allowed',
    track: 'relative w-full rounded-full bg-secondary select-none',
    indicator: 'rounded-full bg-primary select-none',
    thumb: [
      'rounded-full border border-primary bg-background shadow-sm transition-[scale] select-none motion-reduce:transition-none',
      'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
      'data-dragging:scale-110 data-disabled:cursor-not-allowed',
    ],
  },
  variants: {
    size: {
      sm: { control: 'py-2', track: 'h-1', thumb: 'size-3.5' },
      md: { control: 'py-2.5', track: 'h-1.5', thumb: 'size-[18px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type SliderVariantProps = VariantProps<typeof sliderVariants>;
