import { CircleAlert, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import { tokenInputVariants, type TokenInputVariantProps } from './token-input.variants';

export interface TokenInputChipProps extends TokenInputVariantProps {
  children: ReactNode;
  /** Validation message; marks the chip invalid and is read after its text. */
  error?: string | null;
  /** Shows the remove button when given. */
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** A committed entry inside TokenInput: text, invalid state and a remove button. */
export function TokenInputChip({ children, error, onRemove, removeLabel: removeLabelProp, disabled, size, className }: TokenInputChipProps) {
  const { t } = useI18n();
  const removeLabel = removeLabelProp ?? t('common.remove');
  const s = tokenInputVariants({ size });
  return (
    <span
      role="listitem"
      title={error ?? undefined}
      data-invalid={error ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn('group/chip', s.chip(), className)}
    >
      {error && <CircleAlert size={11} strokeWidth={2.4} aria-hidden className="shrink-0" />}
      <span className={s.chipText()}>{children}</span>
      {error && <span className="sr-only">, {t('common.invalid', { error })}</span>}
      {onRemove && (
        <button type="button" aria-label={removeLabel} disabled={disabled} className={s.chipRemove()} onClick={onRemove}>
          <X size={11} strokeWidth={2.4} aria-hidden />
        </button>
      )}
    </span>
  );
}
