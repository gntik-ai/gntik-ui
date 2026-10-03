import { useRef, useState } from 'react';
import { Calendar, type CalendarSingleProps } from '../Calendar/Calendar';
import { formatDate, toISODate } from '../Calendar/calendar-utils';
import { Popover, PopoverContent } from '../Popover';
import { DateTrigger } from './DateTrigger';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import type { DatePickerVariantProps } from './date-picker.variants';

type CalendarPassThrough = Pick<CalendarSingleProps, 'locale' | 'weekStartsOn' | 'min' | 'max' | 'isDateDisabled' | 'today'>;

export interface DatePickerProps extends CalendarPassThrough, DatePickerVariantProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  /** Intl options for the field text. */
  formatOptions?: Intl.DateTimeFormatOptions;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submitted as `YYYY-MM-DD` through a hidden input. */
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/** Initial focus inside the popup: the calendar's tabbable day. */
export function focusCalendarDay(container: HTMLElement | null) {
  return container?.querySelector<HTMLElement>('button[data-day][tabindex="0"]') ?? true;
}

/**
 * Date field: a read-only input with the formatted date that opens a Popover with a Calendar.
 * Enter/Space/click open it, focus lands on the selected day, picking a day (or Escape)
 * closes it and focus returns to the field.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  formatOptions,
  placeholder: placeholderProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  id,
  disabled,
  invalid,
  size,
  className,
  locale: localeProp,
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  today,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DatePickerProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const placeholder = placeholderProp ?? t('datePicker.placeholder');
  const [inner, setInner] = useState<Date | null>(defaultValue ?? null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const date = value !== undefined ? value : inner;
  const open = openProp ?? innerOpen;

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger
        text={date ? formatDate(date, locale, formatOptions) : ''}
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        invalid={invalid}
        size={size}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {name && <input type="hidden" name={name} value={date ? toISODate(date) : ''} />}
      <PopoverContent aria-label={t('datePicker.choose')} align="start" sideOffset={6} padding="none" initialFocus={() => focusCalendarDay(calendarRef.current)}>
        <Calendar
          ref={calendarRef}
          aria-label={t('datePicker.choose')}
          value={date}
          onValueChange={(d) => {
            setInner(d);
            onValueChange?.(d);
            setOpen(false);
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          today={today}
        />
      </PopoverContent>
    </Popover>
  );
}
