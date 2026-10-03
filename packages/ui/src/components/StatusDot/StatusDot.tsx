import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { statusDotVariants, type StatusDotVariantProps } from './status-dot.variants';

export interface StatusDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'>, StatusDotVariantProps {
  className?: string;
  ref?: Ref<HTMLSpanElement>;
  /** Visible text next to the dot. Without it, pass `aria-label` (or keep the dot decorative). */
  label?: ReactNode;
  /** Soft ping animation for live / in-progress states. Off under prefers-reduced-motion. */
  pulse?: boolean;
}

/**
 * Small state indicator: a coloured dot with an optional label. Colour is never the only
 * signal — give it a `label` or an `aria-label` (then it is exposed as role="img").
 */
export function StatusDot({ tone, size, label, pulse = false, className, ...props }: StatusDotProps) {
  const s = statusDotVariants({ tone, size });
  const named = label == null && props['aria-label'] != null;
  return (
    <span
      role={named ? 'img' : undefined}
      aria-hidden={label == null && !named ? true : undefined}
      data-tone={tone ?? 'neutral'}
      className={cn(s.root(), className)}
      {...props}
    >
      <span aria-hidden className={s.dot()}>
        {pulse && <span data-pulse className={s.ping()} />}
      </span>
      {label != null && <span className={s.label()}>{label}</span>}
    </span>
  );
}
