import { type ClearableProps } from '../../utils/clear-control';
import { useId, useRef, useState, type Ref } from 'react';
import { Calendar, type CalendarSingleProps } from '../Calendar/Calendar';
import { formatDate, toISODate } from '../Calendar/calendar-utils';
import { Button } from '../Button';
import { Popover, PopoverContent } from '../Popover';
import { TimePicker } from '../TimePicker/TimePicker';
import { formatTimeOfDay, timeOfDay, withTimeOfDay, parseTimeOfDay } from '../TimePicker/time-utils';
import { DateTrigger } from './DateTrigger';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { formatTimeZoneLabel, fromZonedParts, isValidTimeZone, zonedParts } from '../../i18n/time-zone';
import { datePickerVariants, type DatePickerVariantProps } from './date-picker.variants';

type CalendarPassThrough = Pick<
  CalendarSingleProps,
  'locale' | 'weekStartsOn' | 'min' | 'max' | 'isDateDisabled' | 'today' | 'maxView' | 'captionLayout'
>;

export interface DatePickerProps extends CalendarPassThrough, DatePickerVariantProps, ClearableProps {
  readOnly?: boolean;
  /** Ref to the trigger input. Focusing it leaves the popup closed. */
  ref?: Ref<HTMLInputElement>;
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  /** Intl options for the field text. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Display and edit in this IANA zone. Defaults to the provider zone, then the browser zone. */
  timeZone?: string;
  /** Hide the zone in the field text and time label. */
  hideTimeZone?: boolean;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submits the calendar day, or wall time with `withTime`; non-system zones include the UTC offset. */
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
  ref,
  value,
  defaultValue,
  onValueChange,
  formatOptions,
  timeZone: timeZoneProp,
  hideTimeZone = false,
  placeholder: placeholderProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  id,
  disabled,
  readOnly,
  clearable,
  clearLabel,
  onClear,
  invalid,
  size,
  variant,
  className,
  locale: localeProp,
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  maxView,
  captionLayout,
  today,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  withTime = false,
  hourCycle,
  timeStep,
  withSeconds = false,
}: DatePickerProps) {
  const { t, timeZone: providerZone } = useI18n();
  const requestedZone = timeZoneProp ?? providerZone;
  const zone = isValidTimeZone(requestedZone) ? requestedZone : 'system';
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const placeholder = placeholderProp ?? t(withTime ? 'datePicker.dateTimePlaceholder' : 'datePicker.placeholder');
  const [inner, setInner] = useState<Date | null>(defaultValue ?? null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const timeLabelId = useId();
  const date = value !== undefined ? value : inner;
  const open = openProp ?? innerOpen;
  // Calendar consumes local-midnight days; these proxies represent the zone's calendar date.
  const proxyDay = (instant: Date) => {
    const p = zonedParts(instant, zone);
    return new Date(p.year, p.month - 1, p.day);
  };

  const setOpen = (next: boolean) => {
    if (next && (readOnly || disabled)) return;
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const change = (d: Date | null) => {
    setInner(d);
    onValueChange?.(d);
  };
  const clear = () => {
    change(null);
    onClear?.();
  };
  const clearAction =
    clearable && date && !disabled && !readOnly ? (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          clear();
          setOpen(false);
        }}
      >
        {t('common.clear')}
      </Button>
    ) : null;
  const timeFormat: Intl.DateTimeFormatOptions = formatOptions ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
    ...(hourCycle ? { hourCycle: hourCycle === 12 ? 'h12' : 'h23' } : {}),
  };
  const parts = date && zone !== 'system' ? zonedParts(date, zone) : null;
  const time = date
    ? parts
      ? { hours: parts.hour, minutes: parts.minute, seconds: parts.second }
      : timeOfDay(date)
    : null;
  const zoneLabel = zone !== 'system' && !hideTimeZone ? formatTimeZoneLabel(zone, date ?? new Date(), locale) : null;
  const fieldFormat = withTime ? timeFormat : formatOptions;
  // Intl styles cannot be combined with timeZoneName; replace an embedded name or append it.
  const usesStyle = fieldFormat?.dateStyle !== undefined || fieldFormat?.timeStyle !== undefined;
  let text = '';
  if (date) {
    if (zone === 'system') text = formatDate(date, locale, fieldFormat);
    else if (usesStyle) {
      const formatter = new Intl.DateTimeFormat(locale, { ...fieldFormat, timeZone: zone });
      const embeddedZone = formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value;
      const formatted = formatter.format(date);
      text = embeddedZone
        ? formatted.replace(embeddedZone, zoneLabel ?? '').trim()
        : formatted + (zoneLabel ? ` ${zoneLabel}` : '');
    } else {
      text = formatDate(date, locale, {
        ...(fieldFormat ?? { year: 'numeric', month: 'short', day: 'numeric' }),
        timeZone: zone,
        timeZoneName: hideTimeZone ? undefined : (fieldFormat?.timeZoneName ?? 'short'),
      });
    }
  }
  let hidden = date
    ? withTime
      ? `${toISODate(date)}T${formatTimeOfDay(timeOfDay(date), withSeconds)}`
      : toISODate(date)
    : '';
  if (date && parts && time) {
    const pad = (n: number) => String(n).padStart(2, '0');
    hidden = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
    if (withTime) {
      const wall = new Date(0);
      wall.setUTCFullYear(parts.year, parts.month - 1, parts.day);
      wall.setUTCHours(parts.hour, parts.minute, parts.second, parts.millisecond);
      const offset = Math.round((wall.getTime() - date.getTime()) / 60_000);
      hidden += `T${formatTimeOfDay(time, withSeconds)}${offset < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
    }
  }
  const s = datePickerVariants({ size });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger
        ref={ref}
        text={text}
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        readOnly={readOnly}
        clearable={clearable}
        clearLabel={clearLabel}
        onClear={clear}
        invalid={invalid}
        size={size}
        variant={variant}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {name && <input type="hidden" name={name} value={hidden} />}
      <PopoverContent
        aria-label={t('datePicker.choose')}
        align="start"
        sideOffset={6}
        padding="none"
        initialFocus={() => focusCalendarDay(calendarRef.current)}
      >
        <Calendar
          key={String(open)}
          ref={calendarRef}
          aria-label={t('datePicker.choose')}
          value={zone === 'system' || !date ? date : proxyDay(date)}
          onValueChange={(d) => {
            if (withTime) {
              if (zone === 'system') {
                change(withTimeOfDay(d, date ? timeOfDay(date) : { hours: 0, minutes: 0, seconds: 0 }));
              } else {
                change(
                  fromZonedParts(
                    {
                      year: d.getFullYear(),
                      month: d.getMonth() + 1,
                      day: d.getDate(),
                      hour: time?.hours ?? 0,
                      minute: time?.minutes ?? 0,
                      second: time?.seconds ?? 0,
                    },
                    zone,
                    'compatible',
                  ),
                );
              }
              return;
            }
            change(
              zone === 'system'
                ? d
                : fromZonedParts(
                    {
                      year: d.getFullYear(),
                      month: d.getMonth() + 1,
                      day: d.getDate(),
                      hour: 0,
                      minute: 0,
                    },
                    zone,
                    'compatible',
                  ),
            );
            setOpen(false);
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          min={zone === 'system' || !min ? min : proxyDay(min)}
          max={zone === 'system' || !max ? max : proxyDay(max)}
          isDateDisabled={isDateDisabled}
          maxView={maxView}
          captionLayout={captionLayout}
          today={zone === 'system' ? today : proxyDay(today ?? new Date())}
        />
        {!withTime && clearAction && <div className={s.timeRow()}>{clearAction}</div>}
        {withTime && (
          <div className={s.timeRow()}>
            <span id={timeLabelId} className={s.timeLabel()}>
              {zoneLabel ? t('datePicker.timeIn', { timeZone: zoneLabel }) : t('datePicker.time')}
            </span>
            <TimePicker
              aria-labelledby={timeLabelId}
              value={time ? formatTimeOfDay(time, withSeconds) : null}
              onValueChange={(v) => {
                const tod = parseTimeOfDay(v);
                if (tod) {
                  change(
                    zone === 'system'
                      ? withTimeOfDay(date ?? today ?? new Date(), tod)
                      : fromZonedParts(
                          {
                            ...zonedParts(date ?? today ?? new Date(), zone),
                            hour: tod.hours,
                            minute: tod.minutes,
                            second: tod.seconds,
                            millisecond: 0,
                          },
                          zone,
                          'compatible',
                        ),
                  );
                }
              }}
              hourCycle={hourCycle}
              locale={locale}
              step={timeStep}
              withSeconds={withSeconds}
              size="sm"
              className="w-auto flex-1"
            />
            {clearAction}
            <Button size="sm" onClick={() => setOpen(false)}>
              {t('datePicker.done')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
