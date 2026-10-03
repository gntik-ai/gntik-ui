import { Meter as BaseMeter } from '@base-ui/react/meter';
import type { ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { getMeterLevel, meterVariants, type MeterThresholds, type MeterVariantProps } from './meter.variants';

export interface MeterProps extends Omit<BaseMeter.Root.Props, 'className' | 'children'>, Omit<MeterVariantProps, 'level'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Visible label; also the accessible name. Without it, pass `aria-label`. */
  label?: ReactNode;
  /** Replaces the formatted value, e.g. "8.2k / 10k requests". Pair with `aria-valuetext`. */
  valueLabel?: ReactNode;
  /** Hides the value text. */
  hideValue?: boolean;
  /** Percent-of-max thresholds for the warning and destructive levels. */
  thresholds?: MeterThresholds;
  /**
   * Inverts the thresholds: low values are bad (scores, health, remaining budget). Default
   * false (high is bad, as for quotas). Defaults become warning ≤ 50 %, destructive ≤ 20 %.
   */
  higherIsBetter?: boolean;
  /** Helper line under the bar, coloured by level (e.g. "Overage billed at $0.002 / request"). */
  note?: ReactNode;
}

/**
 * Quota / usage meter (role="meter") on Base UI Meter. Values over `max` are clamped for
 * assistive tech and the bar, but the level (and your `valueLabel`) reflect the overage.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  size,
  label,
  valueLabel,
  hideValue = false,
  thresholds,
  higherIsBetter = false,
  note,
  className,
  ...props
}: MeterProps) {
  const range = max - min;
  const percent = range > 0 ? ((value - min) / range) * 100 : 0;
  const level = getMeterLevel(percent, thresholds, higherIsBetter);
  const s = meterVariants({ level, size });
  const clamped = Math.min(Math.max(value, min), max);
  return (
    <BaseMeter.Root value={clamped} min={min} max={max} data-level={level} className={cn(s.root(), className)} {...props}>
      {(label != null || !hideValue) && (
        <div className={s.header()}>
          {label != null ? <BaseMeter.Label className={s.label()}>{label}</BaseMeter.Label> : <span />}
          {!hideValue && (valueLabel != null ? <span className={s.value()}>{valueLabel}</span> : <BaseMeter.Value className={s.value()} />)}
        </div>
      )}
      <BaseMeter.Track className={s.track()}>
        <BaseMeter.Indicator className={s.indicator()} />
      </BaseMeter.Track>
      {note != null && <p className={s.note()}>{note}</p>}
    </BaseMeter.Root>
  );
}
