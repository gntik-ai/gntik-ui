import { X } from 'lucide-react';
import type { HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { tokenVariants, type TokenVariantProps } from './token.variants';

export interface TokenProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children' | 'prefix'>,
    Omit<TokenVariantProps, 'removable'> {
  className?: string;
  ref?: Ref<HTMLSpanElement>;
  /** The chip text (e.g. a filter value or a recipient). */
  label: ReactNode;
  /** Optional text before the label, muted (e.g. the filter key: "Region:"). */
  prefix?: ReactNode;
  /** Leading slot: an icon (`aria-hidden`) or a small Avatar. */
  icon?: ReactNode;
  /** Renders the remove button; called on click, Enter, Space, Backspace or Delete. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Defaults to "Remove {label}" for string labels. */
  removeLabel?: string;
  disabled?: boolean;
}

/**
 * Removable chip used by filter bars and recipient inputs. The remove button is the only
 * focus target; Backspace or Delete on it also removes the chip.
 */
export function Token({
  label,
  prefix,
  icon,
  tone,
  size,
  onRemove,
  removeLabel,
  disabled = false,
  className,
  ...props
}: TokenProps) {
  const { t } = useI18n();
  const s = tokenVariants({ tone, size, removable: onRemove != null });
  const name = removeLabel ?? (typeof label === 'string' || typeof label === 'number' ? t('common.removeItem', { label }) : t('common.remove'));
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || !onRemove) return;
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      onRemove();
    }
  };
  return (
    <span data-disabled={disabled || undefined} className={cn(s.root(), className)} {...props}>
      {icon != null && <span className={s.leading()}>{icon}</span>}
      {prefix != null && <span className="shrink-0 text-muted-foreground">{prefix}</span>}
      <span className={s.label()}>{label}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={name}
          disabled={disabled}
          onClick={onRemove}
          onKeyDown={onKeyDown}
          className={s.remove()}
        >
          <X size={size === 'sm' ? 11 : 12} strokeWidth={2.4} aria-hidden />
        </button>
      )}
    </span>
  );
}
