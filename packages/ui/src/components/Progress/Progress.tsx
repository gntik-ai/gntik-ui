import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { progressVariants, type ProgressVariantProps } from './progress.variants';

export interface ProgressProps extends Omit<BaseProgress.Root.Props, 'className' | 'children'>, ProgressVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Visible label; also the accessible name. Without it, pass `aria-label`. */
  label?: ReactNode;
  /** Shows the formatted value (e.g. "72%") opposite the label. */
  showValue?: boolean;
}

/**
 * Task progress bar (role="progressbar") on Base UI Progress. `value={null}` makes it
 * indeterminate: a pulsing segment that holds still under reduced motion.
 */
export function Progress({ tone, size, label, showValue = false, className, ...props }: ProgressProps) {
  const s = progressVariants({ tone, size });
  const indeterminate = props.value == null;
  return (
    <BaseProgress.Root className={cn(s.root(), className)} {...props}>
      {(label != null || (showValue && !indeterminate)) && (
        <div className={s.header()}>
          {label != null ? <BaseProgress.Label className={s.label()}>{label}</BaseProgress.Label> : <span />}
          {showValue && !indeterminate && <BaseProgress.Value className={s.value()} />}
        </div>
      )}
      <BaseProgress.Track className={s.track()}>
        <BaseProgress.Indicator className={s.indicator()} />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
