import { NumberField } from '@base-ui/react/number-field';
import { Minus, MoveHorizontal, Plus } from 'lucide-react';
import { useId, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import { NUMBER_INPUT_ICON_SIZE, numberInputVariants, type NumberInputVariantProps } from './number-input.variants';

export interface NumberInputProps
  extends Omit<NumberField.Root.Props, 'className' | 'render' | 'children' | 'style'>,
    NumberInputVariantProps {
  /** Classes for the outer column (scrub label + field). */
  className?: string;
  /** Classes for the native <input>. */
  inputClassName?: string;
  /** Ref to the visible <input>. */
  ref?: Ref<HTMLInputElement>;
  /** Unit shown after the value ("GB", "req/s", "%"). Decorative: put the unit in the label too. */
  unit?: ReactNode;
  /** Marks the value as invalid (sets aria-invalid). Inside a Field, `Field invalid` does this. */
  invalid?: boolean;
  /** Renders a label above the field that scrubs the value when dragged horizontally. */
  scrubLabel?: ReactNode;
  /** Hide the − / + buttons (arrow keys still step). */
  hideSteppers?: boolean;
  decrementLabel?: string;
  incrementLabel?: string;
  placeholder?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** PageUp/PageDown step by `largeStep`: re-dispatched as Shift+ArrowUp/Down, which Base UI handles. */
function onPageKey(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== 'PageUp' && event.key !== 'PageDown') return;
  event.preventDefault();
  event.currentTarget.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key: event.key === 'PageUp' ? 'ArrowUp' : 'ArrowDown',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
}

/**
 * Numeric input on Base UI NumberField: − / + steppers, an optional unit suffix and scrub
 * label, min/max/step clamping and locale formatting (`format`). Works inside Field.
 */
export function NumberInput({
  size = 'md',
  align,
  className,
  inputClassName,
  ref,
  unit,
  invalid,
  scrubLabel,
  hideSteppers = false,
  decrementLabel: decrementLabelProp,
  incrementLabel: incrementLabelProp,
  placeholder,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: NumberInputProps) {
  const { t } = useI18n();
  const decrementLabel = decrementLabelProp ?? t('numberInput.decrease');
  const incrementLabel = incrementLabelProp ?? t('numberInput.increase');
  const autoId = useId();
  const inputId = id ?? (scrubLabel != null ? autoId : undefined);
  const s = numberInputVariants({ size, align });
  const px = NUMBER_INPUT_ICON_SIZE[size];
  return (
    <NumberField.Root id={inputId} className={cn(s.root(), className)} {...props}>
      {scrubLabel != null && (
        <NumberField.ScrubArea className={s.scrub()}>
          <label htmlFor={inputId}>{scrubLabel}</label>
          <NumberField.ScrubAreaCursor className={s.scrubCursor()}>
            <MoveHorizontal size={16} aria-hidden />
          </NumberField.ScrubAreaCursor>
        </NumberField.ScrubArea>
      )}
      <NumberField.Group className={s.group()} data-invalid={invalid || undefined}>
        {!hideSteppers && (
          <NumberField.Decrement aria-label={decrementLabel} className={cn(s.stepper(), s.decrement())}>
            <Minus size={px} aria-hidden />
          </NumberField.Decrement>
        )}
        <NumberField.Input
          ref={ref}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={invalid || undefined}
          onKeyDown={onPageKey}
          className={cn(s.input(), inputClassName)}
        />
        {unit != null && (
          <span aria-hidden className={s.unit()}>
            {unit}
          </span>
        )}
        {!hideSteppers && (
          <NumberField.Increment aria-label={incrementLabel} className={cn(s.stepper(), s.increment())}>
            <Plus size={px} aria-hidden />
          </NumberField.Increment>
        )}
      </NumberField.Group>
    </NumberField.Root>
  );
}
