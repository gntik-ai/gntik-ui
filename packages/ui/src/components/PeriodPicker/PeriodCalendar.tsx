import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { RTL_FLIP } from '../../utils/rtl';
import { calendarVariants } from '../Calendar/calendar.variants';
import { cn } from '../../utils/cn';
import {
  compareDay,
  endOfPeriod,
  normalizeRange,
  addMonths,
  startOfDay,
  formatMonth,
  startOfPeriod,
  isSameDay,
  type PeriodGranularity,
} from '../Calendar/calendar-utils';
import { MonthGrid, QuarterGrid, YearGrid, WeekGrid, yearPageStart, periodCellKey } from '../Calendar/period-grids';
import { usePeriodI18n, periodUnavailable, periodLabel } from './period-utils';
import { periodPickerVariants } from './period-picker.variants';
import { usePeriodValue } from './use-period-value';
import type { PeriodCalendarProps } from './period-types';

export type { PeriodCalendarProps } from './period-types';

/** Inline whole-period selection. */
export function PeriodCalendar(props: PeriodCalendarProps) {
  const granularity = props.granularity ?? 'month';
  const { locale, t } = usePeriodI18n(props.locale);
  const { single, range, changeSingle, changeRange } = usePeriodValue(props);
  const [preview, setPreview] = useState<Date | null>(null);
  const anchor = (props.mode === 'range' ? range.start : single) ?? props.today ?? new Date();
  const [focused, setFocused] = useState(() =>
    granularity === 'week' ? startOfDay(anchor) : startOfPeriod(anchor, granularity),
  );
  const [view, setView] = useState<PeriodGranularity>(granularity);
  const drillOrigins = useRef<{ view: PeriodGranularity; date: Date }[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const focusPending = useRef(false);
  const onFocus = (date: Date) => {
    setFocused(date);
    if (props.mode === 'range' && range.start && !range.end) setPreview(null);
  };
  const moveFocus = (date: Date) => {
    focusPending.current = true;
    onFocus(date);
  };
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    rootRef.current?.querySelector<HTMLElement>(`[data-period="${periodCellKey(focused, view)}"]`)?.focus();
  }, [focused, view]);
  const id = useId();
  const s = periodPickerVariants();
  const Grid = view === 'year' ? YearGrid : view === 'quarter' ? QuarterGrid : view === 'week' ? WeekGrid : MonthGrid;
  const pageMonths = view === 'year' ? 144 : view === 'week' ? 1 : 12;
  const pageStart = yearPageStart(focused.getFullYear());
  const title =
    view === 'year'
      ? t('periodPicker.yearPage', { start: pageStart, end: pageStart + 11 })
      : view === 'week'
        ? formatMonth(focused, locale)
        : t('periodPicker.yearTitle', { year: focused.getFullYear() });
  const previewRange =
    range.start && !range.end ? normalizeRange(range.start, startOfPeriod(preview ?? focused, granularity)) : null;
  const shownRange = range.end ? range : previewRange;
  const inRange = (date: Date) => {
    const start = startOfPeriod(date, granularity);
    return (
      view === granularity &&
      !!shownRange?.start &&
      !!shownRange.end &&
      compareDay(start, startOfPeriod(shownRange.start, granularity)) >= 0 &&
      compareDay(start, startOfPeriod(shownRange.end, granularity)) <= 0
    );
  };
  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof props.ref === 'function') props.ref(node);
        else if (props.ref) props.ref.current = node;
      }}
      role="group"
      aria-label={props['aria-label'] ?? t('periodPicker.choose')}
      className={cn(s.calendar(), props.className)}
    >
      <div className={s.header()}>
        <button
          type="button"
          className={calendarVariants().nav()}
          aria-label={t(
            view === 'year'
              ? 'periodPicker.previousYears'
              : view === 'week'
                ? 'calendar.previousMonth'
                : 'periodPicker.previousYear',
          )}
          onClick={() => moveFocus(addMonths(focused, -pageMonths))}
        >
          <ChevronLeft size={16} aria-hidden className={RTL_FLIP} />
        </button>
        {view === 'year' ? (
          <span id={id} aria-live="polite" className={s.title()}>
            {title}
          </span>
        ) : (
          <button
            type="button"
            id={id}
            aria-live="polite"
            aria-description={t(view === 'week' ? 'periodPicker.chooseMonth' : 'periodPicker.chooseYear')}
            className={s.title()}
            onClick={() => {
              drillOrigins.current.push({ view, date: focused });
              setView(view === 'week' ? 'month' : 'year');
              moveFocus(focused);
            }}
          >
            {title}
          </button>
        )}
        <button
          type="button"
          className={calendarVariants().nav()}
          aria-label={t(
            view === 'year'
              ? 'periodPicker.nextYears'
              : view === 'week'
                ? 'calendar.nextMonth'
                : 'periodPicker.nextYear',
          )}
          onClick={() => moveFocus(addMonths(focused, pageMonths))}
        >
          <ChevronRight size={16} aria-hidden className={RTL_FLIP} />
        </button>
      </div>
      <Grid
        focused={focused}
        locale={locale}
        labelId={id}
        label={(date) => periodLabel(date, view, locale, t)}
        weekLabel={(date) => periodLabel(date, 'week', locale, t)}
        onFocus={onFocus}
        onPreview={(date) => setPreview(date)}
        isInRange={inRange}
        onMove={moveFocus}
        isDisabled={(date) =>
          view === granularity && periodUnavailable(startOfPeriod(date, granularity), granularity, props)
        }
        isSelected={(date) =>
          view === granularity &&
          (props.mode === 'range'
            ? inRange(date) ||
              (!!range.start && isSameDay(startOfPeriod(date, granularity), startOfPeriod(range.start, granularity)))
            : !!single && isSameDay(startOfPeriod(date, granularity), startOfPeriod(single, granularity)))
        }
        onSelect={(date) => {
          if (view !== granularity) {
            const origin = drillOrigins.current.pop();
            const targetView = origin?.view ?? granularity;
            const target = view === 'year' ? new Date(date.getFullYear(), origin?.date.getMonth() ?? 0, 1) : date;
            setView(targetView);
            moveFocus(
              targetView === 'week' && origin
                ? addMonths(
                    origin.date,
                    (target.getFullYear() - origin.date.getFullYear()) * 12 +
                      target.getMonth() -
                      origin.date.getMonth(),
                  )
                : target,
            );
            return;
          }
          if (periodUnavailable(startOfPeriod(date, granularity), granularity, props)) return;
          const start = startOfPeriod(date, granularity);
          if (props.mode === 'range') {
            if (!range.start || range.end) changeRange({ start, end: null });
            else {
              const ordered = normalizeRange(range.start, start);
              changeRange({
                start: startOfPeriod(ordered.start!, granularity),
                end: endOfPeriod(ordered.end!, granularity),
              });
            }
            setPreview(null);
          } else changeSingle(start);
        }}
      />
    </div>
  );
}
