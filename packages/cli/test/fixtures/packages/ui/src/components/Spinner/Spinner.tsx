import type { SVGAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Spinner({ size = 16, className, ...props }: SpinnerProps) {
  return <svg width={size} height={size} className={cn('animate-spin text-primary', className)} {...props} />;
}
