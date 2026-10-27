import { Field } from '@base-ui/react/field';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState, type ComponentProps, type Ref } from 'react';
import { ClearControlButton, type ClearableProps } from '../../utils/clear-control';
import { useFieldVariant } from '../../field-variant/field-variant-context';
import { cn } from '../../utils/cn';
import { PopoverTrigger } from '../Popover';
import { datePickerVariants, type DatePickerVariantProps } from './date-picker.variants';

export interface DateTriggerProps extends DatePickerVariantProps, ClearableProps {
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
  text: string;
  placeholder: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Read-only input that opens the popover (combobox with a dialog popup). It is both the
 * Popover trigger and a Base UI Field control, so FieldLabel / FieldDescription wire to it.
 */
export function DateTrigger({
  ref,
  text,
  placeholder,
  id,
  disabled,
  invalid,
  size = 'auto',
  variant,
  className,
  clearable,
  clearLabel,
  onClear,
  readOnly,
  ...aria
}: DateTriggerProps) {
  const fieldVariant = useFieldVariant(variant);
  const [control, setControl] = useState<HTMLInputElement | null>(null);
  const canClear = clearable && !!text && !disabled && !readOnly;
  const clear = () => {
    if (control?.disabled) return;
    onClear?.();
    control?.focus();
  };
  const s = datePickerVariants({ variant: fieldVariant, size });
  const px = size === 'sm' ? 14 : 15;
  const trigger = useRender({
    ref: [ref ?? null, setControl],
    render: (
      <PopoverTrigger
        nativeButton={false}
        disabled={disabled}
        render={(triggerProps) => {
          const { ref, ...rest } = triggerProps as ComponentProps<'input'>;
          return (
            <Field.Control
              ref={ref as Ref<HTMLInputElement>}
              id={id}
              disabled={disabled}
              render={(controlProps) => (
                <input
                  {...mergeProps<'input'>(controlProps as ComponentProps<'input'>, rest, {
                    role: 'combobox',
                    onKeyDown: (event) => {
                      if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
                        event.preventDefault();
                        clear();
                      }
                    },
                    readOnly: true,
                    value: text,
                    placeholder,
                    autoComplete: 'off',
                    'aria-invalid': invalid || undefined,
                    ...(aria['aria-label'] ? { 'aria-label': aria['aria-label'] } : {}),
                    ...(aria['aria-describedby'] ? { 'aria-describedby': aria['aria-describedby'] } : {}),
                    className: cn(
                      s.input(),
                      fieldVariant !== 'outline' && readOnly && 'bg-secondary/40',
                      canClear && 'pe-16',
                    ),
                  })}
                />
              )}
            />
          );
        }}
      />
    ),
  });
  return (
    <div className={cn(s.root(), className)}>
      <CalendarDays size={px} aria-hidden className={s.icon()} />
      {trigger}
      {canClear && (
        <ClearControlButton
          className="absolute end-8"
          control={control}
          allowReadOnly
          clearLabel={clearLabel}
          onClick={clear}
        />
      )}
      <ChevronDown size={px} aria-hidden className={s.chevron()} />
    </div>
  );
}
