import { AlertTriangle, Check } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '../../i18n/messages/en';
import { stepperVariants } from './stepper.variants';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepItem {
  /** Stable key; defaults to the index. */
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  /** Explicit status. Without it, steps before `current` are complete and later ones upcoming. */
  status?: StepStatus;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'onChange'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  steps: StepItem[];
  /** Zero-based index of the current step. */
  current?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Makes completed steps buttons that call this with their index (go back to edit). */
  onStepClick?: (index: number) => void;
  /** Single-line "Step 2 of 5" summary with a thin progress bar instead of the full list. */
  compact?: boolean;
  /** Accessible name of the step list. */
  label?: string;
  /** Visually hidden status words appended to each step (for localisation). */
  statusText?: Partial<Record<StepStatus, string>>;
  /** Compact summary text. */
  formatCount?: (step: number, total: number) => string;
}

const STATUS_KEYS = { complete: 'stepper.complete', current: 'stepper.current', upcoming: 'stepper.upcoming', error: 'stepper.error' } as const satisfies Record<StepStatus, MessageKey>;

/** Resolves each step's status from `current` unless set explicitly. */
export function resolveStepStatus(steps: StepItem[], current: number): StepStatus[] {
  return steps.map((s, i) => s.status ?? (i < current ? 'complete' : i === current ? 'current' : 'upcoming'));
}

/**
 * Wizard progress: an ordered list of steps (complete · current · upcoming · error), horizontal
 * or vertical. The current step carries `aria-current="step"`. With `onStepClick`, completed
 * steps become buttons; `compact` collapses it to "Step 2 of 5".
 */
export function Stepper({
  steps,
  current = 0,
  orientation = 'horizontal',
  onStepClick,
  compact = false,
  label: labelProp,
  statusText,
  formatCount: formatCountProp,
  className,
  ...props
}: StepperProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('common.progress');
  const statuses = resolveStepStatus(steps, current);
  const formatCount = formatCountProp ?? ((step: number, total: number) => t('stepper.step', { step, total }));
  const words: Record<StepStatus, string> = {
    complete: statusText?.complete ?? t(STATUS_KEYS.complete),
    current: statusText?.current ?? t(STATUS_KEYS.current),
    upcoming: statusText?.upcoming ?? t(STATUS_KEYS.upcoming),
    error: statusText?.error ?? t(STATUS_KEYS.error),
  };
  const total = steps.length;
  const base = stepperVariants({ orientation });

  if (compact) {
    const index = Math.min(Math.max(current, 0), Math.max(total - 1, 0));
    const step = steps[index];
    const pct = total ? ((index + 1) / total) * 100 : 0;
    return (
      <nav aria-label={label} className={cn(base.compact(), className)} {...props}>
        <div className={base.compactRow()} aria-current="step">
          <span className={base.compactLabel()}>{step?.label}</span>
          <span className={base.compactCount()}>{formatCount(index + 1, total)}</span>
        </div>
        <div className={base.compactTrack()} aria-hidden>
          <div className={base.compactFill()} style={{ width: `${pct}%` }} />
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={label} className={className} {...props}>
      <ol className={base.list()}>
        {steps.map((step, i) => {
          const status = statuses[i] ?? 'upcoming';
          const clickable = Boolean(onStepClick) && status === 'complete';
          const v = stepperVariants({ orientation, status, interactive: clickable });
          const content = (
            <>
              <span className={v.indicator()} aria-hidden>
                {status === 'complete' ? <Check size={16} strokeWidth={2.6} /> : status === 'error' ? <AlertTriangle size={15} /> : i + 1}
              </span>
              <span className={v.text()}>
                <span className={v.label()}>
                  {step.label}
                  <span className="sr-only">, {words[status]}</span>
                </span>
                {step.description && <span className={v.description()}>{step.description}</span>}
              </span>
            </>
          );
          const currentAttr = status === 'current' ? ('step' as const) : undefined;
          return (
            <li key={step.id ?? i} className={v.item()}>
              {clickable ? (
                <button type="button" className={v.step()} aria-current={currentAttr} onClick={() => onStepClick?.(i)}>
                  {content}
                </button>
              ) : (
                <div className={v.step()} aria-current={currentAttr}>
                  {content}
                </div>
              )}
              {i < total - 1 && (
                <div className={v.connector()} aria-hidden>
                  <div
                    className={v.connectorFill()}
                    style={orientation === 'horizontal' ? { width: status === 'complete' ? '100%' : '0%' } : { height: status === 'complete' ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
