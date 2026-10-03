import type { SVGAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
  /** Accessible label. Without it the spinner is decorative (aria-hidden). */
  label?: string;
}

/** Indeterminate loading indicator; inherits currentColor. */
export function Spinner({ size = 16, label, className, ...props }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('block shrink-0 animate-spin motion-reduce:animate-[spin_1.6s_linear_infinite]', className)}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
