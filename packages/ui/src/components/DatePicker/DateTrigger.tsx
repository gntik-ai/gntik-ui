import { Field } from '@base-ui/react/field';
import { mergeProps } from '@base-ui/react/merge-props';
import { CalendarDays, ChevronDown } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { cn } from '../../utils/cn';
import { PopoverTrigger } from '../Popover';
import { datePickerVariants, type DatePickerVariantProps } from './date-picker.variants';

export interface DateTriggerProps extends DatePickerVariantProps {
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
export function DateTrigger({ text, placeholder, id, disabled, invalid, size = 'auto', className, ...aria }: DateTriggerProps) {
  const s = datePickerVariants({ size });
  const px = size === 'sm' ? 14 : 15;
  return (
    <div className={cn(s.root(), className)}>
      <CalendarDays size={px} aria-hidden className={s.icon()} />
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
                    readOnly: true,
                    value: text,
                    placeholder,
                    autoComplete: 'off',
                    'aria-invalid': invalid || undefined,
                    ...(aria['aria-label'] ? { 'aria-label': aria['aria-label'] } : {}),
                    ...(aria['aria-describedby'] ? { 'aria-describedby': aria['aria-describedby'] } : {}),
                    className: s.input(),
                  })}
                />
              )}
            />
          );
        }}
      />
      <ChevronDown size={px} aria-hidden className={s.chevron()} />
    </div>
  );
}
