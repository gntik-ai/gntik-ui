import { useEffect, useState, type HTMLAttributes, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { formatClock, formatCompact, toIsoDuration, toMs, type DateInput, type DurationUnits } from './format';
import { timerVariants, type TimerVariantProps } from './timer.variants';

export type TimerStatus = 'running' | 'paused' | 'stopped';

export interface TimerLabels {
  /** Status text shown (and announced) when paused. */
  paused: string;
  /** Status text shown (and announced) when stopped. */
  stopped: string;
  /** Unit suffixes of the compact format. */
  units: DurationUnits;
}

const DEFAULT_LABELS: TimerLabels = { paused: 'Paused', stopped: 'Stopped', units: { h: 'h', m: 'm', s: 's' } };

export interface TimerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'>, Pick<TimerVariantProps, 'size'> {
  className?: string;
  ref?: Ref<HTMLSpanElement>;
  /** When the current run started: a Date, an ISO string or epoch ms. */
  start: DateInput;
  /** Time already accumulated before `start` (ms), e.g. earlier runs of a paused-and-resumed task. */
  offset?: number;
  /** `running` ticks; `paused` and `stopped` freeze the value (at `end` when given). */
  status?: TimerStatus;
  /** When the timer was paused or stopped; makes the frozen value exact. */
  end?: DateInput;
  /** `clock` ("1:02:05", default) or `compact` ("2m 14s"). */
  format?: 'clock' | 'compact';
  /** Shows the status dot (and the paused/stopped text). */
  showStatus?: boolean;
  /**
   * Make changes audible: a polite live region that speaks the compact value every
   * `announceEvery` ms. Off by default (role="timer" is silent).
   */
  announce?: boolean;
  /** Announcement interval in ms (default one minute). */
  announceEvery?: number;
  /** Reference time (epoch ms) for the first render, e.g. the server's, so hydration matches. */
  now?: number;
  /** Visible and announced strings (English defaults). */
  labels?: Partial<TimerLabels>;
}

/**
 * Elapsed time since `start`, live while running, in a `<time dateTime="PT…">` element with
 * role="timer". Paused and stopped states freeze the value and show a status dot.
 */
export function Timer({
  start,
  offset = 0,
  status = 'running',
  end,
  format = 'clock',
  showStatus = true,
  announce = false,
  announceEvery = 60_000,
  now: initialNow,
  labels: labelsProp,
  size,
  className,
  ...props
}: TimerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [now, setNow] = useState(() => initialNow ?? Date.now());
  const running = status === 'running';

  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [running]);

  const startMs = toMs(start) ?? now;
  const until = (!running ? toMs(end) : undefined) ?? now;
  const elapsed = Math.max(0, offset + until - startMs);
  const text = format === 'compact' ? formatCompact(elapsed, labels.units) : formatClock(elapsed);
  const statusText = status === 'paused' ? labels.paused : status === 'stopped' ? labels.stopped : undefined;
  const spokenStep = Math.max(1000, announceEvery);
  const spoken = formatCompact(Math.floor(elapsed / spokenStep) * spokenStep, labels.units);
  const s = timerVariants({ size, status });

  return (
    <span role="timer" aria-live={announce ? 'polite' : 'off'} aria-atomic className={cn(s.root(), className)} data-status={status} {...props}>
      {showStatus && <span aria-hidden className={s.dot()} />}
      <time dateTime={toIsoDuration(elapsed)} aria-hidden={announce || undefined}>
        {text}
      </time>
      {announce && <span className="sr-only">{statusText ? `${spoken}, ${statusText}` : spoken}</span>}
      {showStatus && statusText && (
        <span className={s.status()} aria-hidden={announce || undefined}>
          {statusText}
        </span>
      )}
    </span>
  );
}
