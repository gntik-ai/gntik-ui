import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { RTL_FLIP } from '../../utils/rtl';
import { calendarVariants } from './calendar.variants';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarYearView } from './CalendarYearView';
import { CalendarCaption } from './CalendarCaption';
import { periodCellKey, yearPageStart } from './period-grids';
import {
  addDays,
  addMonths,
  clampDay,
  compareDay,
  endOfWeek,
  formatDayLabel,
  formatMonth,
  isSameDay,
  isSameMonth,
  localeWeekStart,
  monthDiff,
  monthOutsideBounds,
  monthWeeks,
  normalizeRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  weekdayNames,
  yearOutsideBounds,
  type DateRange,
  type WeekDay,
} from './calendar-utils';

const s = calendarVariants();

export type CalendarView = 'day' | 'month' | 'year';

interface CalendarCommonProps {
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  maxView?: CalendarView;
  captionLayout?: 'label' | 'select';
  yearRange?: { from: number; to: number };
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** BCP 47 locale for month/weekday names and day labels. Defaults to the I18nProvider's, else the runtime locale. */
  locale?: string;
  /** First column of the week (0 = Sunday). Defaults to the locale's week start. */
  weekStartsOn?: WeekDay;
  /** Earliest selectable day. */
  min?: Date;
  /** Latest selectable day. */
  max?: Date;
  /** Marks extra days as unavailable (weekends, blackout dates…). */
  isDateDisabled?: (date: Date) => boolean;
  /** Visible month (controlled). */
  month?: Date;
  /** Initially visible month. Defaults to the selection, else today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months shown side by side. */
  numberOfMonths?: 1 | 2;
  /** Show the leading/trailing days of adjacent months (non-interactive). */
  showOutsideDays?: boolean;
  /** "Today" for the marker and the initial focus. Defaults to the current date. */
  today?: Date;
  /** Accessible name of the calendar group. */
  'aria-label'?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
}

export interface CalendarSingleProps extends CalendarCommonProps {
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarCommonProps {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  /** Fires on each click: first with `{ start, end: null }`, then with the complete range. */
  onValueChange?: (range: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * Month calendar (role="grid") with single or range selection. Days are buttons with a roving
 * tabindex: arrows move by day/week, PageUp/PageDown by month (Shift: year), Home/End to the
 * week's edges, Enter/Space select. Labels come from Intl in the given locale.
 */
export function Calendar(props: CalendarProps) {
  const {
    className,
    ref,
    view: viewProp,
    defaultView = 'day',
    onViewChange,
    maxView = 'year',
    captionLayout = 'label',
    yearRange,
    locale: localeProp,
    min,
    max,
    isDateDisabled,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    showOutsideDays = numberOfMonths === 1,
    today: todayProp,
    previousMonthLabel: previousMonthLabelProp,
    nextMonthLabel: nextMonthLabelProp,
  } = props;
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  // Inside an I18nProvider its locale applies; outside, the runtime locale.
  const locale = localeProp ?? providerLocale;
  const previousMonthLabel = previousMonthLabelProp ?? t('calendar.previousMonth');
  const nextMonthLabel = nextMonthLabelProp ?? t('calendar.nextMonth');
  const weekStartsOn = props.weekStartsOn ?? localeWeekStart(locale);
  const isRange = props.mode === 'range';
  const baseId = useId();

  const [today] = useState(() => startOfDay(todayProp ?? new Date()));
  const todayDate = todayProp ? startOfDay(todayProp) : today;

  const [innerSingle, setInnerSingle] = useState<Date | null>(() =>
    props.mode === 'range' ? null : (props.defaultValue ?? null),
  );
  const [innerRange, setInnerRange] = useState<DateRange>(() =>
    props.mode === 'range' ? (props.defaultValue ?? EMPTY_RANGE) : EMPTY_RANGE,
  );
  const single = props.mode === 'range' ? null : props.value !== undefined ? props.value : innerSingle;
  const range = props.mode === 'range' ? (props.value ?? innerRange) : EMPTY_RANGE;
  const anchor = (isRange ? range.start : single) ?? todayDate;

  const [innerMonth, setInnerMonth] = useState(() => startOfMonth(defaultMonth ?? anchor));
  const visibleMonth = monthProp ? startOfMonth(monthProp) : innerMonth;
  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(visibleMonth, i));

  const [focused, setFocused] = useState(() => startOfDay(anchor));
  const [innerView, setInnerView] = useState<CalendarView>(defaultView);
  const view = viewProp ?? innerView;
  const [periodFocus, setPeriodFocus] = useState(() => startOfMonth(visibleMonth));
  const [preview, setPreview] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ view: CalendarView; date: Date } | null>(null);
  const completedFocus = useRef<typeof focusRequest>(null);
  const [renderedView, setRenderedView] = useState(view);

  if (renderedView !== view) {
    setRenderedView(view);
    if (view !== 'day') {
      // A heading request preserves its panel; an external transition starts at the visible month.
      const date =
        focusRequest?.view === view ? focusRequest.date : renderedView === 'day' ? visibleMonth : periodFocus;
      setPeriodFocus(startOfMonth(date));
      setFocusRequest({ view, date });
    } else if (focusRequest?.view !== 'day') {
      setFocusRequest(null);
    }
  }

  const isVisible = (d: Date) => {
    const diff = monthDiff(visibleMonth, d);
    return diff >= 0 && diff < numberOfMonths;
  };
  const isDisabled = (d: Date) =>
    (!!min && compareDay(d, min) < 0) || (!!max && compareDay(d, max) > 0) || !!isDateDisabled?.(d);

  // The one day in the tab order: the focused day if visible, else selection, today, or day 1.
  const tabbable =
    [focused, isRange ? range.start : single, todayDate].find((d): d is Date => !!d && isVisible(d)) ?? visibleMonth;

  useEffect(() => {
    // A controlled parent may apply a requested view on a later render.
    if (!focusRequest || focusRequest.view !== view || completedFocus.current === focusRequest) return;
    const selector =
      view === 'day'
        ? `[data-day="${toISODate(focusRequest.date)}"]`
        : `[data-period="${periodCellKey(focusRequest.date, view)}"]`;
    const target = rootRef.current?.querySelector<HTMLButtonElement>(selector);
    if (target) {
      completedFocus.current = focusRequest;
      target.focus();
    }
  }, [focusRequest, view, visibleMonth]);

  const changeView = (next: CalendarView, date = periodFocus) => {
    if (next === view) return;
    setFocusRequest({ view: next, date });
    setInnerView(next);
    onViewChange?.(next);
  };

  const setMonth = (m: Date) => {
    const next = startOfMonth(m);
    setInnerMonth(next);
    onMonthChange?.(next);
  };

  const pickMonth = (date: Date, panelIndex = 0) => {
    const target = clampDay(addMonths(focused, monthDiff(focused, date)), min, max);
    setFocused(target);
    setMonth(addMonths(target, -panelIndex));
    changeView('day', target);
  };

  const focusPeriod = (date: Date) => {
    setPeriodFocus(view === 'year' ? new Date(date.getFullYear(), periodFocus.getMonth(), 1) : date);
  };
  const periodDisabled = (date: Date) => (view === 'year' ? yearOutsideBounds : monthOutsideBounds)(date, min, max);
  const pageDisabled = (date: Date) => {
    if (view === 'month') return yearOutsideBounds(date, min, max);
    const start = yearPageStart(date.getFullYear());
    return (!!min && min.getFullYear() > start + 11) || (!!max && max.getFullYear() < start);
  };
  const movePeriod = (date: Date) => {
    if (pageDisabled(date)) return;
    setFocusRequest({ view, date });
    focusPeriod(date);
  };

  const moveFocus = (next: Date) => {
    const target = clampDay(next, min, max);
    setFocusRequest({ view: 'day', date: target });
    setFocused(target);
    if (isRange && range.start && !range.end) setPreview(target);
    const diff = monthDiff(visibleMonth, target);
    if (diff < 0) setMonth(target);
    else if (diff > numberOfMonths - 1) setMonth(addMonths(startOfMonth(target), -(numberOfMonths - 1)));
  };

  const select = (d: Date) => {
    if (isDisabled(d)) return;
    setFocused(d);
    if (props.mode === 'range') {
      const next = !range.start || range.end ? { start: d, end: null } : normalizeRange(range.start, d);
      setInnerRange(next);
      setPreview(null);
      props.onValueChange?.(next);
    } else {
      setInnerSingle(d);
      props.onValueChange?.(d);
    }
  };

  const onDayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, d: Date) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl' ? -1 : 1;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -rtl),
      ArrowRight: () => addDays(d, rtl),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      PageUp: () => addMonths(d, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, e.shiftKey ? 12 : 1),
      Home: () => startOfWeek(d, weekStartsOn),
      End: () => endOfWeek(d, weekStartsOn),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    moveFocus(move());
  };

  const previewRange = isRange && range.start && !range.end && preview ? normalizeRange(range.start, preview) : null;
  const shownRange = range.start && range.end ? range : previewRange;
  const inRange = (d: Date) =>
    !!shownRange?.start &&
    !!shownRange.end &&
    compareDay(d, shownRange.start) >= 0 &&
    compareDay(d, shownRange.end) <= 0;

  const firstMonth = months[0] ?? visibleMonth;
  const lastMonth = months[months.length - 1] ?? visibleMonth;
  const prevDisabled = !!min && monthDiff(min, firstMonth) <= 0;
  const nextDisabled = !!max && monthDiff(lastMonth, max) <= 0;
  const weekdays = weekdayNames(locale, weekStartsOn);
  const yearStart = yearPageStart(periodFocus.getFullYear());
  const periodTitle =
    view === 'year'
      ? t('periodPicker.yearPage', { start: yearStart, end: yearStart + 11 })
      : new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(periodFocus);
  const PeriodView = view === 'year' ? CalendarYearView : CalendarMonthView;
  const periodStep = view === 'year' ? 144 : 12;

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      ref={setRefs}
      role="group"
      aria-label={props['aria-label'] ?? t('calendar.label')}
      className={cn(s.root(), className)}
    >
      {view !== 'day' ? (
        <div className={s.month()}>
          <div className={s.header()}>
            <button
              type="button"
              aria-label={t(view === 'year' ? 'calendar.previousYears' : 'calendar.previousYear', { count: 12 })}
              disabled={pageDisabled(addMonths(periodFocus, -periodStep))}
              className={s.nav()}
              onClick={() => movePeriod(addMonths(periodFocus, -periodStep))}
            >
              <ChevronLeft size={16} aria-hidden className={RTL_FLIP} />
            </button>
            {captionLayout === 'select' ? (
              <CalendarCaption
                month={periodFocus}
                today={todayDate}
                locale={locale}
                min={min}
                max={max}
                yearRange={yearRange}
                labelId={`${baseId}-period`}
                onChange={pickMonth}
              />
            ) : (
              <h2
                id={view === 'month' && maxView === 'year' ? undefined : `${baseId}-period`}
                aria-live="polite"
                className={s.heading()}
              >
                {view === 'month' && maxView === 'year' ? (
                  <button
                    type="button"
                    className={s.headingButton()}
                    aria-label={t('calendar.chooseYear', { label: periodTitle })}
                    onClick={() => changeView('year')}
                  >
                    <span id={`${baseId}-period`}>{periodTitle}</span>
                  </button>
                ) : (
                  periodTitle
                )}
              </h2>
            )}
            <button
              type="button"
              aria-label={t(view === 'year' ? 'calendar.nextYears' : 'calendar.nextYear', { count: 12 })}
              disabled={pageDisabled(addMonths(periodFocus, periodStep))}
              className={s.nav()}
              onClick={() => movePeriod(addMonths(periodFocus, periodStep))}
            >
              <ChevronRight size={16} aria-hidden className={RTL_FLIP} />
            </button>
          </div>
          <PeriodView
            focused={periodFocus}
            labelId={`${baseId}-period`}
            locale={locale ?? new Intl.DateTimeFormat().resolvedOptions().locale}
            onFocus={focusPeriod}
            onMove={movePeriod}
            onSelect={(date) => {
              if (periodDisabled(date)) return;
              if (view === 'year') {
                focusPeriod(date);
                changeView('month', new Date(date.getFullYear(), periodFocus.getMonth(), 1));
              } else pickMonth(date);
            }}
            isDisabled={periodDisabled}
            isSelected={(date) =>
              [single, range.start, range.end].some(
                (value) =>
                  !!value && (view === 'year' ? value.getFullYear() === date.getFullYear() : isSameMonth(value, date)),
              )
            }
            isCurrent={(date) =>
              view === 'year' ? date.getFullYear() === todayDate.getFullYear() : isSameMonth(date, todayDate)
            }
          />
        </div>
      ) : (
        months.map((m, mi) => {
          const headingId = `${baseId}-m${mi}`;
          return (
            <div key={toISODate(m)} className={s.month()}>
              <div className={s.header()}>
                {mi === 0 ? (
                  <button
                    type="button"
                    aria-label={previousMonthLabel}
                    disabled={prevDisabled}
                    className={s.nav()}
                    onClick={() => setMonth(addMonths(visibleMonth, -1))}
                  >
                    <ChevronLeft size={16} aria-hidden className={RTL_FLIP} />
                  </button>
                ) : (
                  <span className={s.navSpacer()} />
                )}
                {captionLayout === 'select' ? (
                  <CalendarCaption
                    month={m}
                    today={todayDate}
                    locale={locale}
                    min={min}
                    max={max}
                    yearRange={yearRange}
                    labelId={headingId}
                    onChange={(date) => pickMonth(date, mi)}
                  />
                ) : (
                  <h2 id={maxView === 'day' ? headingId : undefined} aria-live="polite" className={s.heading()}>
                    {maxView === 'day' ? (
                      formatMonth(m, locale)
                    ) : (
                      <button
                        type="button"
                        className={s.headingButton()}
                        aria-label={t('calendar.chooseMonth', { label: formatMonth(m, locale) })}
                        onClick={() => {
                          setPeriodFocus(startOfMonth(m));
                          changeView('month', m);
                        }}
                      >
                        <span id={headingId}>{formatMonth(m, locale)}</span>
                      </button>
                    )}
                  </h2>
                )}
                {mi === months.length - 1 ? (
                  <button
                    type="button"
                    aria-label={nextMonthLabel}
                    disabled={nextDisabled}
                    className={s.nav()}
                    onClick={() => setMonth(addMonths(visibleMonth, 1))}
                  >
                    <ChevronRight size={16} aria-hidden className={RTL_FLIP} />
                  </button>
                ) : (
                  <span className={s.navSpacer()} />
                )}
              </div>
              <table role="grid" aria-labelledby={headingId} className={s.grid()}>
                <thead>
                  <tr>
                    {weekdays.map((w) => (
                      <th key={w.long} scope="col" className={s.weekday()}>
                        <abbr title={w.long} className={s.weekdayAbbr()}>
                          {w.narrow}
                        </abbr>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthWeeks(m, weekStartsOn).map((week) => (
                    <tr key={toISODate(week[0] ?? m)}>
                      {week.map((d) => {
                        const key = toISODate(d);
                        if (!isSameMonth(d, m)) {
                          return (
                            <td key={key} className={s.cell()}>
                              {showOutsideDays && (
                                <span aria-hidden className={s.outside()}>
                                  {d.getDate()}
                                </span>
                              )}
                            </td>
                          );
                        }
                        const disabled = isDisabled(d);
                        const selected = isRange
                          ? isSameDay(d, range.start) || isSameDay(d, range.end)
                          : isSameDay(d, single);
                        const within = isRange && inRange(d);
                        const rangeStart = within && isSameDay(d, shownRange?.start);
                        const rangeEnd = within && isSameDay(d, shownRange?.end);
                        const today = isSameDay(d, todayDate);
                        return (
                          <td
                            key={key}
                            aria-selected={selected || within}
                            data-in-range={within || undefined}
                            data-range-start={rangeStart || undefined}
                            data-range-end={rangeEnd || undefined}
                            className={s.cell()}
                          >
                            <button
                              type="button"
                              data-day={key}
                              data-selected={selected || undefined}
                              data-today={today || undefined}
                              data-in-range={within || undefined}
                              tabIndex={isSameDay(d, tabbable) ? 0 : -1}
                              aria-label={formatDayLabel(d, locale)}
                              aria-current={today ? 'date' : undefined}
                              aria-disabled={disabled || undefined}
                              className={s.day()}
                              onClick={() => select(d)}
                              onKeyDown={(e) => onDayKeyDown(e, d)}
                              onFocus={() => setFocused(d)}
                              onMouseEnter={isRange && range.start && !range.end ? () => setPreview(d) : undefined}
                            >
                              {d.getDate()}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
