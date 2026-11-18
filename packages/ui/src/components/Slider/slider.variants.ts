import { tv, type VariantProps } from '../../utils/tv';

export const sliderVariants = tv({
  slots: {
    root: 'flex w-full flex-col gap-2 data-disabled:opacity-50 data-invalid:[&_[data-index]]:border-destructive/70 aria-invalid:[&_[data-index]]:border-destructive/70',
    header: 'flex items-baseline justify-between gap-3',
    label: 'text-[13px] font-medium text-foreground',
    value: 'font-mono text-[12px] text-muted-foreground tabular-nums',
    control: 'flex w-full touch-none items-center select-none data-disabled:cursor-disabled',
    track:
      'relative w-full rounded-full bg-secondary select-none forced-colors:outline forced-colors:-outline-offset-1 forced-colors:outline-[CanvasText]',
    indicator: 'rounded-full bg-primary select-none forced-colors:bg-[Highlight]',
    thumb: [
      'rounded-full border border-primary bg-background shadow-sm transition-[scale] select-none motion-reduce:transition-none',
      'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
      'data-dragging:scale-110 data-disabled:cursor-disabled',
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

// Kept separate so the default public variants output and existing snapshots stay unchanged.
export const sliderInputVariants = tv({
  slots: {
    row: 'grid grid-cols-[1fr_auto] items-center gap-3',
    input: 'w-20',
  },
});

export const sliderMarkVariants = tv({
  slots: {
    mark: 'pointer-events-none absolute top-1/2 -mt-0.5 -ms-0.5 size-1 rounded-full bg-muted-foreground/50 forced-colors:bg-[CanvasText]',
    markLabels: 'pointer-events-none absolute top-full mt-3 h-4 w-full',
    markLabel: 'absolute max-w-full truncate text-[11.5px] text-muted-foreground',
  },
  variants: {
    active: {
      true: {
        mark: 'bg-primary-foreground/70 forced-colors:bg-[HighlightText]',
        markLabel: 'font-medium text-foreground',
      },
    },
    edge: { middle: { markLabel: '-translate-x-1/2 rtl:translate-x-1/2' }, start: {}, end: {} },
  },
});
