import { OTPField } from '@base-ui/react/otp-field';
import { Fragment, useId, type Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { otpInputVariants, type OtpInputVariantProps } from './otp-input.variants';

export interface OtpInputProps
  extends
    Omit<OTPField.Root.Props, 'className' | 'render' | 'children' | 'length' | 'validationType' | 'onValueComplete' | 'style'>,
    OtpInputVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Number of characters (4–8). */
  length?: 4 | 5 | 6 | 7 | 8;
  /** Accepted characters. Alphanumeric codes are upper-cased. */
  type?: 'numeric' | 'alphanumeric';
  /** Marks the code as invalid (sets aria-invalid on every slot). Inside a Field, `Field invalid` does this. */
  invalid?: boolean;
  /** Called once every slot is filled (typing or paste). */
  onComplete?: (value: string) => void;
  /** Draws a separator after every N slots (e.g. 3 → "123–456"). */
  groupSize?: number;
  /** Accessible name of each slot after the first, which takes the field label. */
  slotLabel?: (position: number, length: number) => string;
}

const upper = (v: string) => v.toUpperCase();

/**
 * One-time code input on Base UI OTPField: one box per character, typing auto-advances,
 * Backspace steps back, paste fills every slot, and `onComplete` fires when full. Label it
 * with a Field (the first slot takes the label) or `aria-label` (names the group).
 */
export function OtpInput({
  length = 6,
  type = 'numeric',
  size,
  invalid,
  onComplete,
  groupSize,
  slotLabel: slotLabelProp,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: OtpInputProps) {
  const { t } = useI18n();
  const slotLabel = slotLabelProp ?? ((index: number, total: number) => t('otp.character', { index, total }));
  const s = otpInputVariants({ size });
  const hiddenLabelId = useId();
  // Base UI names the first slot from a <label>/Field.Label or aria-labelledby (never aria-label),
  // so an `aria-label` becomes a hidden labelling element shared by the group and the first slot.
  const labelledBy = ariaLabelledBy ?? (ariaLabel != null ? hiddenLabelId : undefined);
  const named = labelledBy != null;
  return (
    <>
      {ariaLabel != null && ariaLabelledBy == null && (
        <span id={hiddenLabelId} hidden>
          {ariaLabel}
        </span>
      )}
      <OTPField.Root
        length={length}
        validationType={type}
        normalizeValue={type === 'alphanumeric' ? upper : undefined}
        onValueComplete={onComplete ? (v) => onComplete(v) : undefined}
        aria-labelledby={labelledBy}
        data-invalid={invalid || undefined}
        className={cn(s.root(), className)}
        {...props}
      >
        {Array.from({ length }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && groupSize && i % groupSize === 0 ? <OTPField.Separator className={s.separator()} /> : null}
            <OTPField.Input
              className={s.slot()}
              aria-invalid={invalid || undefined}
              aria-label={i === 0 ? undefined : slotLabel(i + 1, length)}
              aria-labelledby={i === 0 && named ? labelledBy : undefined}
            />
          </Fragment>
        ))}
      </OTPField.Root>
    </>
  );
}
