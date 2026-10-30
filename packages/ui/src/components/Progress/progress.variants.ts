import { tv, type VariantProps } from '../../utils/tv';

export const progressVariants = tv({
  slots: {
    root: 'grid w-full gap-1.5',
    header: 'flex items-center justify-between gap-3',
    label: 'text-[12.5px] font-medium text-foreground',
    value: 'font-mono text-[11.5px] font-semibold tabular-nums text-tone-text',
    track:
      'relative w-full overflow-hidden rounded-full bg-secondary forced-colors:outline forced-colors:-outline-offset-1 forced-colors:outline-[CanvasText]',
    indicator: [
      'block h-full rounded-full transition-[width] duration-400 ease-out motion-reduce:transition-none forced-colors:bg-[Highlight]',
      'bg-tone',
      'data-[indeterminate]:w-2/5 data-[indeterminate]:animate-pulse motion-reduce:data-[indeterminate]:animate-none',
    ],
  },
  variants: {
    tone: {
      primary: { value: 'text-foreground' },
      success: {},
      warning: {},
      destructive: {},
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
