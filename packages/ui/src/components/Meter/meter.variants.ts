import { tv, type VariantProps } from '../../utils/tv';

/**
 * Usage meter. The level comes from the thresholds: green while healthy, amber near the cap,
 * red at or over it. The brand green never signals severity on its own.
 */
export const meterVariants = tv({
  slots: {
    root: 'grid w-full gap-1.5',
    header: 'flex items-baseline justify-between gap-3',
    label: 'text-[13px] font-medium text-foreground',
    value: 'font-mono text-[11.5px] font-semibold tabular-nums',
    track: 'relative w-full overflow-hidden rounded-full bg-secondary',
    indicator: 'block h-full rounded-full transition-[width] duration-400 ease-out motion-reduce:transition-none',
    note: 'font-mono text-[11px]',
  },
  variants: {
    level: {
      ok: { indicator: 'bg-primary', value: 'text-foreground', note: 'text-muted-foreground' },
      warning: { indicator: 'bg-warning', value: 'text-warning-text', note: 'text-warning-text' },
      critical: { indicator: 'bg-destructive', value: 'text-destructive-text', note: 'text-destructive-text' },
    },
    size: {
      sm: { track: 'h-1.5' },
      md: { track: 'h-2' },
      lg: { track: 'h-2.5' },
    },
  },
  defaultVariants: { level: 'ok', size: 'md' },
});

export type MeterVariantProps = VariantProps<typeof meterVariants>;
export type MeterLevel = NonNullable<MeterVariantProps['level']>;

export interface MeterThresholds {
  /**
   * Percent of max at which the meter turns amber. Default 80 (at or above). With
   * `higherIsBetter`, the meter turns amber at or below it; default 50.
   */
  warning?: number;
  /**
   * Percent of max at which the meter turns red. Default 100 (at or above). With
   * `higherIsBetter`, the meter turns red at or below it; default 20.
   */
  destructive?: number;
}

/**
 * Maps a percentage of max to a level using the thresholds. By default high is bad (quotas);
 * pass `higherIsBetter` for scores, health or remaining budget, where low is bad.
 */
export function getMeterLevel(percent: number, thresholds: MeterThresholds = {}, higherIsBetter = false): MeterLevel {
  if (higherIsBetter) {
    const { warning = 50, destructive = 20 } = thresholds;
    if (percent <= destructive) return 'critical';
    if (percent <= warning) return 'warning';
    return 'ok';
  }
  const { warning = 80, destructive = 100 } = thresholds;
  if (percent >= destructive) return 'critical';
  if (percent >= warning) return 'warning';
  return 'ok';
}
