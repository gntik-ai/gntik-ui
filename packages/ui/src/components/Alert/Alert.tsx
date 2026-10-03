import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import { alertVariants, type AlertTone, type AlertVariantProps } from './alert.variants';

const TONE_ICON: Record<AlertTone, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  destructive: CircleAlert,
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'>, AlertVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  title?: ReactNode;
  /** Body text; `children` is used when this is not set. */
  description?: ReactNode;
  /** Action row under the text (buttons or links). */
  actions?: ReactNode;
  /** Replaces the tone icon; `null` hides it. */
  icon?: LucideIcon | null;
  /** Renders a dismiss button; called on click, Enter or Space. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. */
  dismissLabel?: string;
  children?: ReactNode;
}

/**
 * Inline banner. role="alert" (assertive) for destructive, role="status" (polite) otherwise;
 * override with `role`. Labelled by its title and described by its body.
 */
export function Alert({
  tone = 'info',
  title,
  description,
  actions,
  icon,
  onDismiss,
  dismissLabel: dismissLabelProp,
  className,
  children,
  role,
  ...props
}: AlertProps) {
  const { t } = useI18n();
  const dismissLabel = dismissLabelProp ?? t('common.dismiss');
  const s = alertVariants({ tone });
  const id = useId();
  const Icon = icon === undefined ? TONE_ICON[tone] : icon;
  const body = description ?? children;
  return (
    <div
      role={role ?? (tone === 'destructive' ? 'alert' : 'status')}
      aria-labelledby={title != null ? `${id}-title` : undefined}
      aria-describedby={body != null ? `${id}-desc` : undefined}
      className={cn(s.root(), className)}
      {...props}
    >
      {Icon && <Icon size={18} strokeWidth={1.9} aria-hidden className={s.icon()} />}
      <div className={s.content()}>
        {title != null && <div id={`${id}-title`} className={s.title()}>{title}</div>}
        {body != null && <div id={`${id}-desc`} className={cn(s.description(), title != null && 'mt-1')}>{body}</div>}
        {actions != null && <div className={s.actions()}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label={dismissLabel} onClick={onDismiss} className={s.dismiss()}>
          <X size={14} strokeWidth={2.4} aria-hidden />
        </button>
      )}
    </div>
  );
}
