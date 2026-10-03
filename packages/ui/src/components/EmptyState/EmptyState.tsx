import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { EMPTY_STATE_ICON_SIZE, emptyStateVariants, type EmptyStateVariantProps } from './emptyState.variants';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'>, EmptyStateVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Neutral icon in a soft halo (a lucide icon component). */
  icon?: LucideIcon;
  title: ReactNode;
  /** Heading level that fits the page outline. */
  titleAs?: 'h2' | 'h3' | 'h4';
  description?: ReactNode;
  /** Main call to action (e.g. a primary Button). */
  primaryAction?: ReactNode;
  /** Secondary action shown after the primary one. */
  secondaryAction?: ReactNode;
  /** Extra content under the actions (templates, links…). */
  children?: ReactNode;
}

/** Placeholder for a list, table or page with nothing to show yet: why, and what to do next. */
export function EmptyState({
  icon: Icon,
  title,
  titleAs: Heading = 'h3',
  description,
  primaryAction,
  secondaryAction,
  size,
  bordered,
  className,
  children,
  ...props
}: EmptyStateProps) {
  const s = emptyStateVariants({ size, bordered });
  return (
    <div className={cn(s.root(), className)} {...props}>
      {Icon && (
        <div className={s.icon()}>
          <Icon size={EMPTY_STATE_ICON_SIZE[size ?? 'md']} aria-hidden />
        </div>
      )}
      <Heading className={cn(s.title(), !Icon && 'mt-0')}>{title}</Heading>
      {description != null && <p className={s.description()}>{description}</p>}
      {(primaryAction != null || secondaryAction != null) && (
        <div className={s.actions()}>
          {primaryAction}
          {secondaryAction}
        </div>
      )}
      {children}
    </div>
  );
}
