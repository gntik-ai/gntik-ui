import type { HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { skeletonVariants, type SkeletonVariantProps } from './skeleton.variants';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>, SkeletonVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** For `shape="text"`: number of lines; the last one is shorter. */
  lines?: number;
}

/**
 * Loading placeholder. Always decorative (aria-hidden): announce loading on the container,
 * e.g. `<div role="status" aria-label="Loading members">`. The pulse stops under reduced motion.
 */
export function Skeleton({ shape, lines = 1, className, ...props }: SkeletonProps) {
  const s = skeletonVariants({ shape });
  if (shape === 'text' && lines > 1) {
    return (
      <div aria-hidden className={cn(s.lines(), className)} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cn(s.block(), i === lines - 1 && 'w-2/3')} />
        ))}
      </div>
    );
  }
  return <div aria-hidden className={cn(s.block(), className)} {...props} />;
}
