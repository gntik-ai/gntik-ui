import { tv, type VariantProps } from '../../utils/tv';

export const progressVariants = tv({
  slots: {
    root: 'grid w-full gap-1.5',
    header: 'flex items-center justify-between gap-3',
    label: 'text-[12.5px] font-medium text-foreground',
    value: 'font-mono text-[11.5px] font-semibold tabular-nums',
    track: 'relative w-full overflow-hidden rounded-full bg-secondary',
    indicator: [
      'block h-full rounded-full transition-[width] duration-400 ease-out motion-reduce:transition-none',
      'data-[indeterminate]:w-2/5 data-[indeterminate]:animate-pulse motion-reduce:data-[indeterminate]:animate-none',
    ],
  },
  variants: {
    tone: {
      primary: { indicator: 'bg-primary', value: 'text-foreground' },
      success: { indicator: 'bg-success', value: 'text-success-text' },
      warning: { indicator: 'bg-warning', value: 'text-warning-text' },
      destructive: { indicator: 'bg-destructive', value: 'text-destructive-text' },
    },
    size: {
      sm: { track: 'h-1.5' },
      md: { track: 'h-2' },
      lg: { track: 'h-2.5' },
    },
  },
  defaultVariants: { tone: 'primary', size: 'md' },
});

export type ProgressVariantProps = VariantProps<typeof progressVariants>;
