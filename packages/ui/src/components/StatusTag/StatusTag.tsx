import type { Ref } from 'react';
import { cn } from '../../utils/cn';
import { Badge, type BadgeProps } from '../Badge/Badge';
import { DEFAULT_STATUSES, statusTagVariants, type StatusDefinition, type StatusTagVariantProps } from './statusTag.variants';

export interface StatusTagProps extends Omit<BadgeProps, 'tone' | 'dot' | 'onRemove' | 'removeLabel' | 'children'>, StatusTagVariantProps {
  ref?: Ref<HTMLSpanElement>;
  /** State key, looked up in `statuses` (then the generic defaults). */
  status: string;
  /** Extra or overriding state → { label, tone } entries. */
  statuses?: Record<string, StatusDefinition>;
  /** Overrides the mapped label. */
  label?: string;
}

/**
 * State pill with a dot. The state → tone mapping is a dictionary prop, merged over a small
 * set of generic states; unknown states fall back to a neutral tag showing the raw key.
 */
export function StatusTag({ status, statuses, label, uppercase, className, ...props }: StatusTagProps) {
  const def = statuses?.[status] ?? DEFAULT_STATUSES[status];
  const tone = def?.tone ?? 'neutral';
  return (
    <Badge tone={tone} dot data-status={status} className={cn(statusTagVariants({ uppercase }), className)} {...props}>
      {label ?? def?.label ?? status}
    </Badge>
  );
}
