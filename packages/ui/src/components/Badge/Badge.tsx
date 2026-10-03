import { X } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { badgeVariants, type BadgeVariantProps } from './badge.variants';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'>, BadgeVariantProps {
  className?: string;
  ref?: Ref<HTMLSpanElement>;
  /** Leading dot in the tone colour (inherits the text colour on `solid`). */
  dot?: boolean;
  /** Renders a remove button; called on click, Enter or Space. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Defaults to "Remove <label>" for string children. */
  removeLabel?: string;
  children?: ReactNode;
}

/** Compact label for status, counts and categories. Optionally removable (tags). */
export function Badge({
  tone,
  variant,
  size,
  shape,
  dot = false,
  onRemove,
  removeLabel,
  className,
  children,
  ...props
}: BadgeProps) {
  const { t } = useI18n();
  const s = badgeVariants({ tone, variant, size, shape });
  const label = removeLabel ?? (typeof children === 'string' ? t('common.removeItem', { label: children }) : t('common.remove'));
  return (
    <span className={cn(s.root(), onRemove && 'pe-1.5', className)} {...props}>
      {dot && <span aria-hidden className={s.dot()} />}
      {children}
      {onRemove && (
        <button type="button" aria-label={label} onClick={onRemove} className={s.remove()}>
          <X size={11} strokeWidth={2.4} aria-hidden />
        </button>
      )}
    </span>
  );
}
