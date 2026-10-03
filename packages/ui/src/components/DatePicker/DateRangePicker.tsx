import { useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { Calendar, type CalendarRangeProps } from '../Calendar/Calendar';
import { formatDateRange, startOfDay, toISODate, type DateRange } from '../Calendar/calendar-utils';
import { Popover, PopoverContent } from '../Popover';
import { focusCalendarDay } from './DatePicker';
import { DateTrigger } from './DateTrigger';
import { DEFAULT_DATE_RANGE_PRESETS, matchPreset, type DateRangePreset } from './date-range-presets';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { datePickerVariants, type DatePickerVariantProps } from './date-picker.variants';

type CalendarPassThrough = Pick<CalendarRangeProps, 'locale' | 'weekStartsOn' | 'min' | 'max' | 'isDateDisabled' | 'numberOfMonths'>;

export interface DateRangePickerProps extends CalendarPassThrough, DatePickerVariantProps {
  value?: DateRange;
  defaultValue?: DateRange;
  /** Fires with complete ranges only (both ends set). */
  onValueChange?: (range: DateRange) => void;
  /** Quick ranges shown beside the calendar; pass `[]` to hide them. */
  presets?: DateRangePreset[];
  /** "Today" for the presets and the marker. Defaults to the current date. */
  today?: Date;
  formatOptions?: Intl.DateTimeFormatOptions;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submitted as `<name>-start` / `<name>-end` (`YYYY-MM-DD`). */
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const EMPTY: DateRange = { start: null, end: null };

/**
 * Date range field: the formatted range in a read-only input that opens presets (Today,
 * Last 7 days, Last 30 days, This month, Last month, Custom) next to a two-month range
 * Calendar. A preset or the second calendar click applies the range and closes the popup.
 */
export function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  today: todayProp,
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
  numberOfMonths = 2,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DateRangePickerProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const placeholder = placeholderProp ?? t('datePicker.rangePlaceholder');
  const [inner, setInner] = useState<DateRange>(defaultValue ?? EMPTY);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<DateRange>(value ?? inner);
  const [customActive, setCustomActive] = useState(false);
  const [now] = useState(() => startOfDay(new Date()));
  const today = todayProp ? startOfDay(todayProp) : now;
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const range = value ?? inner;
  const open = openProp ?? innerOpen;
  const s = datePickerVariants({ size });
  const active = customActive ? presets.find((p) => !p.range) : (matchPreset(presets, draft, today) ?? (draft.start ? presets.find((p) => !p.range) : undefined));

  const setOpen = (next: boolean) => {
    if (next) {
      setDraft(range);
      setCustomActive(false);
    }
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const apply = (next: DateRange) => {
    setInner(next);
    onValueChange?.(next);
    setOpen(false);
  };

  const pickPreset = (p: DateRangePreset) => {
    if (p.range) {
      apply(p.range(today));
      return;
    }
    setCustomActive(true);
    const day = focusCalendarDay(calendarRef.current);
    if (day !== true) day.focus();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger
        text={formatDateRange(range, locale, formatOptions)}
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        invalid={invalid}
        size={size}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {name && (
        <>
          <input type="hidden" name={`${name}-start`} value={range.start ? toISODate(range.start) : ''} />
          <input type="hidden" name={`${name}-end`} value={range.end ? toISODate(range.end) : ''} />
        </>
      )}
      <PopoverContent aria-label={t('datePicker.chooseRange')} align="start" sideOffset={6} padding="none" initialFocus={() => focusCalendarDay(calendarRef.current)}>
        <div className={s.panel()}>
          {presets.length > 0 && (
            <div role="group" aria-label={t('datePicker.presets')} className={s.presets()}>
              {presets.map((p) => (
                <button key={p.id} type="button" aria-pressed={active?.id === p.id} className={cn(s.preset())} onClick={() => pickPreset(p)}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <Calendar
            ref={calendarRef}
            mode="range"
            aria-label={t('datePicker.chooseRange')}
            value={draft}
            onValueChange={(r) => {
              setDraft(r);
              setCustomActive(true);
              if (r.start && r.end) apply(r);
            }}
            numberOfMonths={numberOfMonths}
            defaultMonth={draft.end && numberOfMonths === 2 ? new Date(draft.end.getFullYear(), draft.end.getMonth() - 1, 1) : undefined}
            locale={locale}
            weekStartsOn={weekStartsOn}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            today={today}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Alias: the range field is also catalogued as DateRangeInput. */
export const DateRangeInput = DateRangePicker;
export type DateRangeInputProps = DateRangePickerProps;
