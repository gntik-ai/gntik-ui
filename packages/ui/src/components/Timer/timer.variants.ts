import { tv, type VariantProps } from '../../utils/tv';

export const timerVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-1.5 font-mono tabular-nums text-foreground',
    dot: 'size-1.5 shrink-0 rounded-full',
    status: 'font-sans text-muted-foreground',
  },
  variants: {
    size: {
      sm: { root: 'text-[11.5px]', status: 'text-[11px]' },
      md: { root: 'text-[13px]', status: 'text-[12px]' },
      lg: { root: 'text-[20px] font-semibold tracking-tight', dot: 'size-2', status: 'text-[13px] font-normal' },
    },
    status: {
      running: { dot: 'animate-pulse bg-success motion-reduce:animate-none' },
      paused: { root: 'text-muted-foreground', dot: 'bg-warning' },
      stopped: { root: 'text-muted-foreground', dot: 'bg-muted-foreground' },
    },
  },
  defaultVariants: { size: 'md', status: 'running' },
});

export type TimerVariantProps = VariantProps<typeof timerVariants>;
