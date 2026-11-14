import { FieldVariantProvider } from '../../field-variant/FieldVariantProvider';
import { type ClearableProps } from '../../utils/clear-control';
import { Button } from '../Button';
import { useContext, useRef, useState, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { Calendar, type CalendarRangeProps } from '../Calendar/Calendar';
import {
  formatDateRange,
  localDate,
  localeWeekStart,
  outsideRangeLimits,
  startOfDay,
  toISODate,
  validRangeLimit,
  type DateRange,
} from '../Calendar/calendar-utils';
import { compareFieldDates } from '../DateField/date-parts';
import type { DateRangeChangeDetails } from '../DateField/DateRangeField';
import { Popover, PopoverContent } from '../Popover';
import { InFieldContext } from '../../utils/in-field-context';
import { PeriodCalendar } from '../PeriodPicker/PeriodCalendar';
import { usePeriodI18n } from '../PeriodPicker/period-utils';
import { focusCalendarDay } from './DatePicker';
import { DateTrigger } from './DateTrigger';
import { EditableRangeTrigger } from './EditableDateTrigger';
import { DEFAULT_DATE_RANGE_PRESETS, matchPreset, type DateRangePreset } from './date-range-presets';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import {
  focusPeriodCell,
  periodFieldText,
  periodRangeUnavailable,
  snapPeriodRange,
  type DatePickerGranularity,
} from './period-field';
import { datePickerVariants, type DatePickerVariantProps } from './date-picker.variants';

type CalendarPassThrough = Pick<
  CalendarRangeProps,
  | 'locale'
  | 'weekStartsOn'
  | 'min'
  | 'max'
  | 'isDateDisabled'
  | 'numberOfMonths'
  | 'maxView'
  | 'captionLayout'
  | 'getDayMarkers'
  | 'highlightedDates'
  | 'highlightedLabel'
  | 'loading'
  | 'renderDay'
  | 'onMonthChange'
  | 'maxRange'
  | 'minRange'
>;

export interface DateRangePickerProps extends CalendarPassThrough, DatePickerVariantProps, ClearableProps {
  readOnly?: boolean;
  /** Ref to the trigger input. Focusing it leaves the popup closed. */
  ref?: Ref<HTMLInputElement>;
  value?: DateRange;
  defaultValue?: DateRange;
  /** Fires with complete ranges, or an empty range when cleared. */
  onValueChange?: (range: DateRange) => void;
  /**
   * Type or paste the two dates into locale-ordered segments (a DateRangeField, the Field control) with a calendar
   * button that opens the popup, instead of the read-only trigger. A complete valid pair is reported once; an
   * incomplete pair is not, and clearing every segment reports an empty range. An end before the start is marked
   * invalid and not reported; a pair outside `min`, `max`, `isDateDisabled` (the typed start is its `rangeStart`) or
   * the range limits is reported and marked invalid. Applies to `granularity="day"`; `ref` and `variant` are not
   * applied.
   */
  editable?: boolean;
  /** Fires on every calendar pick, including the partial `{ start, end: null }`. Presets do not fire it. */
  onCalendarChange?: (range: DateRange) => void;
  /**
   * What the popup picks. `day` (default) opens the two-month day calendar; `week`, `month`, `quarter` and `year`
   * open the matching period grid and emit whole periods: the first day of the earlier period to the last day of
   * the later one, in either click order. Weeks start on `weekStartsOn` (or the locale's first day). `isDateDisabled`,
   * `maxRange`, `minRange` and `numberOfMonths` apply to `day` only; `min` and `max` disable periods outside them.
   */
  granularity?: DatePickerGranularity;
  /**
   * Quick ranges shown beside the calendar; pass `[]` to hide them. The day presets are hidden when `granularity`
   * is not `day` unless you pass presets; their ranges are widened to whole periods.
   */
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
  ref,
  value,
  defaultValue,
  onValueChange,
  onCalendarChange,
  presets: presetsProp,
  editable = false,
  today: todayProp,
  formatOptions,
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
  maxRange,
  minRange,
  isDateDisabled,
  maxView,
  captionLayout,
  getDayMarkers,
  highlightedDates,
  highlightedLabel,
  loading,
  renderDay,
  onMonthChange,
  numberOfMonths = 2,
  granularity = 'day',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DateRangePickerProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const periodI18n = usePeriodI18n(locale);
  const period = granularity === 'day' ? null : granularity;
  const typedEntry = editable && !period;
  const inheritedDisabled = !!useContext(InFieldContext)?.disabled;
  const fieldDisabled = disabled || (typedEntry && inheritedDisabled);
  const periodWeekStart = weekStartsOn ?? localeWeekStart(locale);
  const presets = presetsProp ?? (period ? [] : DEFAULT_DATE_RANGE_PRESETS);
  const placeholder = placeholderProp ?? t('datePicker.rangePlaceholder');
  const [inner, setInner] = useState<DateRange>(defaultValue ?? EMPTY);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<DateRange>(value ?? inner);
  const [customActive, setCustomActive] = useState(false);
  const [announceLimit, setAnnounceLimit] = useState(false);
  const maximum = period ? undefined : validRangeLimit(maxRange);
  const [now] = useState(() => startOfDay(new Date()));
  const today = todayProp ? startOfDay(todayProp) : now;
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const range = value ?? inner;
  // Typed entry: the keys that remount the segments (after a change that did not come from them) and the calendar
  // (after a typed one), and the last value the segments reported so that it does not remount them.
  const [fieldKey, setFieldKey] = useState(0);
  const [typedKey, setTypedKey] = useState(0);
  const rangeKey = `${range.start?.getTime()}:${range.end?.getTime()}`;
  const [seenKey, setSeenKey] = useState(rangeKey);
  const [typedRangeKey, setTypedRangeKey] = useState(rangeKey);
  // What the segments hold while the pair is not reportable (a start without an end, or an end before the start):
  // the calendar previews it even though nothing was emitted.
  const [typedPreview, setTypedPreview] = useState<DateRange | null>(null);
  if (seenKey !== rangeKey) {
    setSeenKey(rangeKey);
    if (typedEntry && rangeKey !== typedRangeKey) {
      setFieldKey((k) => k + 1);
      setTypedPreview(null);
    }
  }
  // Period ranges always cover whole periods, whatever days a controlled value carries.
  const shown = period ? snapPeriodRange(range, period, periodWeekStart) : range;
  const open = openProp ?? innerOpen;
  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setAnnounceLimit(false);
    if (open) {
      setDraft(typedEntry && typedPreview ? typedPreview : range);
      setCustomActive(false);
    }
  }
  const s = datePickerVariants({ size });
  const active = customActive
    ? presets.find((p) => !p.range)
    : (matchPreset(presets, draft, today) ?? (draft.start ? presets.find((p) => !p.range) : undefined));

  const setOpen = (next: boolean) => {
    if (next && (readOnly || fieldDisabled)) return;
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const apply = (next: DateRange) => {
    if (typedEntry && (fieldDisabled || readOnly)) return;
    // The segments show the new value, not what was typed before it.
    if (typedEntry) {
      setFieldKey((k) => k + 1);
      setTypedPreview(null);
    }
    setInner(next);
    onValueChange?.(next);
    setOpen(false);
  };

  const clear = () => {
    setDraft(EMPTY);
    setCustomActive(false);
    apply(EMPTY);
    onClear?.();
  };

  const periodPresetUnavailable = (r: DateRange | undefined) =>
    !!period && !!r && periodRangeUnavailable(r, period, periodWeekStart, { min, max });

  const pickPreset = (p: DateRangePreset) => {
    if (p.range) {
      const r = p.range(today);
      if (periodPresetUnavailable(r)) return;
      apply(period ? snapPeriodRange(r, period, periodWeekStart) : r);
      return;
    }
    setCustomActive(true);
    const day = period ? focusPeriodCell(calendarRef.current) : focusCalendarDay(calendarRef.current);
    if (day !== true) day.focus();
  };

  // The segments report a pair only when both ends are complete, in order and valid, or all cleared.
  const typeRange = (r: DateRange, { startFill, endFill }: DateRangeChangeDetails) => {
    if (fieldDisabled || readOnly) return;
    const empty = startFill === 'empty' && endFill === 'empty';
    if (
      !empty &&
      (startFill !== 'complete' ||
        endFill !== 'complete' ||
        !r.start ||
        !r.end ||
        compareFieldDates(r.end, r.start, 'day') < 0)
    ) {
      // Not reportable, but the calendar still follows the typed start (and end, when it is not before it).
      const start = startFill === 'complete' ? r.start : null;
      const end =
        endFill === 'complete' && r.end && (!start || compareFieldDates(r.end, start, 'day') >= 0) ? r.end : null;
      setTypedPreview({ start, end });
      setDraft({ start, end });
      setTypedKey((k) => k + 1);
      return;
    }
    setTypedPreview(null);
    const next = empty ? EMPTY : r;
    const key = `${next.start?.getTime()}:${next.end?.getTime()}`;
    if (key === rangeKey) {
      if (typedPreview) {
        setDraft(next);
        setTypedKey((k) => k + 1);
      }
      return;
    }
    setTypedRangeKey(key);
    setInner(next);
    setDraft(next);
    setTypedKey((k) => k + 1);
    onValueChange?.(next);
  };

  const pickRange = (r: DateRange) => {
    if (typedEntry && (fieldDisabled || readOnly)) return;
    setDraft(r);
    setAnnounceLimit(!!r.start && !r.end);
    onCalendarChange?.(r);
    setCustomActive(true);
    if (r.start && r.end) apply(r);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {typedEntry ? (
        <EditableRangeTrigger
          key={fieldKey}
          buttonRef={buttonRef}
          value={range}
          onEdit={typeRange}
          startLabel={t('datePicker.startDate')}
          endLabel={t('datePicker.endDate')}
          onOpenRequest={() => setOpen(true)}
          locale={locale}
          min={min}
          max={max}
          isDateDisabled={
            isDateDisabled || maximum !== undefined || validRangeLimit(minRange) !== undefined
              ? (date, context) =>
                  !!isDateDisabled?.(date, context) ||
                  (!!context.rangeStart && outsideRangeLimits(context.rangeStart, date, minRange, maxRange))
              : undefined
          }
          id={id}
          disabled={fieldDisabled}
          readOnly={readOnly}
          invalid={invalid}
          size={size}
          className={className}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        />
      ) : (
        <DateTrigger
          ref={ref}
          text={
            period
              ? periodFieldText(shown, period, periodI18n.locale, periodI18n.t, periodWeekStart, formatOptions)
              : formatDateRange(range, locale, formatOptions)
          }
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
      )}
      {name && (
        <>
          <input type="hidden" name={`${name}-start`} value={shown.start ? toISODate(shown.start) : ''} />
          <input type="hidden" name={`${name}-end`} value={shown.end ? toISODate(shown.end) : ''} />
        </>
      )}
      <PopoverContent
        aria-label={t('datePicker.chooseRange')}
        align="start"
        sideOffset={6}
        padding="none"
        initialFocus={() => (period ? focusPeriodCell(calendarRef.current) : focusCalendarDay(calendarRef.current))}
        finalFocus={typedEntry ? () => buttonRef.current : undefined}
      >
        <FieldVariantProvider variant="outline">
          {maximum !== undefined && (
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {announceLimit && open ? t('datePicker.rangeLimit', { count: maximum }) : ''}
            </span>
          )}
          <div className={s.panel()}>
            {presets.length > 0 && (
              <div role="group" aria-label={t('datePicker.presets')} className={s.presets()}>
                {presets.map((p) => {
                  const presetRange =
                    !period && (maximum !== undefined || validRangeLimit(minRange) !== undefined)
                      ? p.range?.(today)
                      : undefined;
                  const presetDisabled = period
                    ? periodPresetUnavailable(p.range?.(today))
                    : !!presetRange?.start &&
                      !!presetRange.end &&
                      outsideRangeLimits(presetRange.start, presetRange.end, minRange, maxRange);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={presetDisabled}
                      aria-pressed={active?.id === p.id}
                      className={cn(
                        s.preset(),
                        presetDisabled &&
                          'disabled:cursor-disabled disabled:text-muted-foreground disabled:hover:bg-transparent',
                      )}
                      onClick={() => pickPreset(p)}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
            {period ? (
              <PeriodCalendar
                key={String(open)}
                ref={calendarRef}
                mode="range"
                aria-label={t('datePicker.chooseRange')}
                granularity={period}
                value={draft}
                onValueChange={pickRange}
                locale={periodI18n.locale}
                weekStartsOn={periodWeekStart}
                min={min}
                max={max}
                today={today}
              />
            ) : (
              <Calendar
                key={typedEntry ? `${open}-${typedKey}` : String(open)}
                ref={calendarRef}
                mode="range"
                aria-label={t('datePicker.chooseRange')}
                value={draft}
                onValueChange={pickRange}
                numberOfMonths={numberOfMonths}
                defaultMonth={
                  draft.end && numberOfMonths === 2
                    ? localDate(draft.end.getFullYear(), draft.end.getMonth() - 1, 1)
                    : undefined
                }
                locale={locale}
                weekStartsOn={weekStartsOn}
                min={min}
                max={max}
                maxRange={maxRange}
                minRange={minRange}
                isDateDisabled={isDateDisabled}
                maxView={maxView}
                captionLayout={captionLayout}
                getDayMarkers={getDayMarkers}
                highlightedDates={highlightedDates}
                highlightedLabel={highlightedLabel}
                loading={loading}
                renderDay={renderDay}
                onMonthChange={onMonthChange}
                today={today}
              />
            )}
          </div>
          {clearable && (range.start || range.end) && !disabled && !readOnly && (
            <div className={s.timeRow()}>
              <Button size="sm" variant="ghost" onClick={clear}>
                {t('common.clear')}
              </Button>
            </div>
          )}
        </FieldVariantProvider>
      </PopoverContent>
    </Popover>
  );
}

/** Alias: the range field is also catalogued as DateRangeInput. */
export const DateRangeInput = DateRangePicker;
export type DateRangeInputProps = DateRangePickerProps;
