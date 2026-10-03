import { useId, useRef, useState } from 'react';
import { Calendar, type CalendarSingleProps } from '../Calendar/Calendar';
import { formatDate, toISODate } from '../Calendar/calendar-utils';
import { Button } from '../Button';
import { Popover, PopoverContent } from '../Popover';
import { TimePicker } from '../TimePicker/TimePicker';
import { formatTimeOfDay, timeOfDay, withTimeOfDay, parseTimeOfDay } from '../TimePicker/time-utils';
import { DateTrigger } from './DateTrigger';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { datePickerVariants, type DatePickerVariantProps } from './date-picker.variants';

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
  /** Submitted as `YYYY-MM-DD` (with `withTime`: `YYYY-MM-DDTHH:mm`) through a hidden input. */
  name?: string;
  /**
   * Adds a TimePicker under the calendar: picking a day keeps the popup open (and the time),
   * Done or Escape closes it. The value carries the time; the field shows date and time.
   */
  withTime?: boolean;
  /** Clock of the time field (`withTime`). Defaults to the locale's. */
  hourCycle?: 12 | 24;
  /** Minute step of the time field's arrow keys (`withTime`). */
  timeStep?: number;
  /** Adds seconds to the time field (`withTime`). */
  withSeconds?: boolean;
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
  withTime = false,
  hourCycle,
  timeStep,
  withSeconds = false,
}: DatePickerProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const placeholder = placeholderProp ?? t(withTime ? 'datePicker.dateTimePlaceholder' : 'datePicker.placeholder');
  const [inner, setInner] = useState<Date | null>(defaultValue ?? null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const timeLabelId = useId();
  const date = value !== undefined ? value : inner;
  const open = openProp ?? innerOpen;

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const change = (d: Date | null) => {
    setInner(d);
    onValueChange?.(d);
  };
  const timeFormat: Intl.DateTimeFormatOptions = formatOptions ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
    ...(hourCycle ? { hourCycle: hourCycle === 12 ? 'h12' : 'h23' } : {}),
  };
  const text = date ? formatDate(date, locale, withTime ? timeFormat : formatOptions) : '';
  const hidden = date ? (withTime ? `${toISODate(date)}T${formatTimeOfDay(timeOfDay(date), withSeconds)}` : toISODate(date)) : '';
  const s = datePickerVariants({ size });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger
        text={text}
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        invalid={invalid}
        size={size}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {name && <input type="hidden" name={name} value={hidden} />}
      <PopoverContent aria-label={t('datePicker.choose')} align="start" sideOffset={6} padding="none" initialFocus={() => focusCalendarDay(calendarRef.current)}>
        <Calendar
          ref={calendarRef}
          aria-label={t('datePicker.choose')}
          value={date}
          onValueChange={(d) => {
            if (withTime) {
              change(withTimeOfDay(d, date ? timeOfDay(date) : { hours: 0, minutes: 0, seconds: 0 }));
              return;
            }
            change(d);
            setOpen(false);
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          today={today}
        />
        {withTime && (
          <div className={s.timeRow()}>
            <span id={timeLabelId} className={s.timeLabel()}>
              {t('datePicker.time')}
            </span>
            <TimePicker
              aria-labelledby={timeLabelId}
              value={date ? formatTimeOfDay(timeOfDay(date), withSeconds) : null}
              onValueChange={(v) => {
                const tod = parseTimeOfDay(v);
                if (tod) change(withTimeOfDay(date ?? today ?? new Date(), tod));
              }}
              hourCycle={hourCycle}
              locale={locale}
              step={timeStep}
              withSeconds={withSeconds}
              size="sm"
              className="w-auto flex-1"
            />
            <Button size="sm" onClick={() => setOpen(false)}>
              {t('datePicker.done')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
