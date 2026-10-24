import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn, useI18n, zonedParts, localeWeekStart, type WeekDay } from '@gntik-ai/ui';
import { useSchedulingClock } from '../shared/useSchedulingClock';
import { CalendarHeader } from '../shared/CalendarHeader';
import {
  type HourCycle,
  weekday,
  addDays,
  addMonths,
  dayKey,
  formatFullDate,
  formatMonth,
  formatTime,
  formatWeekday,
  monthGrid,
  weekendDays,
  sameDay,
  sameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '../shared/dates';
import { defaultEventKinds, groupByDay, kindOf, TONE, type EventKind, type ScheduleEvent } from '../shared/events';
import { sampleEvents, sampleToday } from '../shared/fixtures';

export interface MonthCalendarProps {
  events?: ScheduleEvent[];
  /** Display time zone; defaults to the I18nProvider zone (system outside a provider). */
  timeZone?: string;
  /** Clock used for event times; defaults to the provider or runtime locale. */
  hourCycle?: HourCycle;
  /** First weekday; defaults to the provider or runtime locale. */
  weekStartsOn?: WeekDay;
  /** The app's "today" (the block never reads the clock). */
  today?: Date;
  /** Month shown first (uncontrolled). Defaults to the month of `today`. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Initially selected day (uncontrolled). */
  defaultSelected?: Date;
  /** Called when a day is activated (click, Enter or Space). */
  onSelectDate?: (date: Date, events: ScheduleEvent[]) => void;
  /** Event kinds (label, icon, tone) by `event.kind`. */
  kinds?: Record<string, EventKind>;
  /** Event lines per day before "+N more". */
  maxEventsPerDay?: number;
  /** Caller actions in the header (e.g. a "Schedule" button). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Month view of scheduled work: a locale-first grid with up to N events per day.
 * Keyboard: arrows move by day/week, Home/End to the week edges, PageUp/PageDown by month,
 * Enter/Space selects.
 */
export function MonthCalendar({
  events = sampleEvents,
  timeZone: timeZoneProp,
  hourCycle: hourCycleProp,
  weekStartsOn: weekStartsOnProp,
  today = sampleToday,
  defaultMonth,
  onMonthChange,
  defaultSelected,
  onSelectDate,
  kinds = defaultEventKinds,
  maxEventsPerDay = 2,
  actions,
  className,
}: MonthCalendarProps) {
  const { t, locale, dir, timeZone: providerZone } = useI18n();
  const timeZone = timeZoneProp ?? providerZone;
  const clock = useSchedulingClock(hourCycleProp);
  const weekStartsOn = weekStartsOnProp ?? localeWeekStart(clock.locale);
  const titleId = useId();
  const [selected, setSelected] = useState<Date>(() => startOfDay(defaultSelected ?? today, timeZone));
  const [focused, setFocused] = useState<Date>(() => startOfDay(defaultSelected ?? defaultMonth ?? today, timeZone));
  const [month, setMonth] = useState<Date>(() => startOfMonth(defaultMonth ?? defaultSelected ?? today, timeZone));
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const byDay = useMemo(() => groupByDay(events, timeZone), [events, timeZone]);
  const weeks = monthGrid(month, weekStartsOn, timeZone);
  const weekend = weekendDays(clock.locale);
  // The roving tab stop stays inside the visible month.
  const tabStop = sameMonth(focused, month, timeZone)
    ? focused
    : sameMonth(selected, month, timeZone)
      ? selected
      : month;

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${dayKey(focused, timeZone)}"]`)?.focus();
  }, [focused, timeZone]);

  const showMonth = (next: Date) => {
    const first = startOfMonth(next, timeZone);
    setMonth(first);
    onMonthChange?.(first);
  };

  const go = (date: Date) => {
    setFocused(date);
    if (!sameMonth(date, month, timeZone)) showMonth(date);
    moveFocus.current = true;
  };

  const select = (date: Date) => {
    setSelected(date);
    setFocused(date);
    onSelectDate?.(date, byDay.get(dayKey(date, timeZone)) ?? []);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const weekStart = startOfWeek(date, weekStartsOn, timeZone);
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, dir === 'rtl' ? 1 : -1, timeZone),
      ArrowRight: () => addDays(date, dir === 'rtl' ? -1 : 1, timeZone),
      ArrowUp: () => addDays(date, -7, timeZone),
      ArrowDown: () => addDays(date, 7, timeZone),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6, timeZone),
      PageUp: () => addDays(addMonths(date, -1, timeZone), Math.min(zonedParts(date, timeZone).day, 28) - 1, timeZone),
      PageDown: () => addDays(addMonths(date, 1, timeZone), Math.min(zonedParts(date, timeZone).day, 28) - 1, timeZone),
    };
    const next = map[event.key];
    if (!next) return;
    event.preventDefault();
    go(next());
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <CalendarHeader
        timeZone={timeZone}
        referenceDate={month}
        titleId={titleId}
        title={formatMonth(month, locale, timeZone)}
        prevLabel={t('calendar.previousMonth')}
        nextLabel={t('calendar.nextMonth')}
        onPrev={() => showMonth(addMonths(month, -1, timeZone))}
        onNext={() => showMonth(addMonths(month, 1, timeZone))}
        onToday={() => {
          showMonth(today);
          setFocused(startOfDay(today, timeZone));
        }}
        actions={actions}
      />
      <div ref={gridRef} role="grid" aria-labelledby={titleId}>
        <div role="row" className="grid grid-cols-7 border-b border-border bg-secondary/30">
          {(weeks[0] ?? []).map((day) => (
            <div
              key={weekday(day, timeZone)}
              role="columnheader"
              aria-label={formatWeekday(day, locale, 'long', timeZone)}
              className="py-2 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
            >
              {formatWeekday(day, locale, 'short', timeZone)}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={dayKey(week[0] ?? month, timeZone)} role="row" className="grid grid-cols-7">
            {week.map((date) => {
              const key = dayKey(date, timeZone);
              const list = byDay.get(key) ?? [];
              const inMonth = sameMonth(date, month, timeZone);
              const isToday = sameDay(date, today, timeZone);
              const isSelected = sameDay(date, selected, timeZone);
              const extra = list.length - maxEventsPerDay;
              return (
                <div
                  key={key}
                  role="gridcell"
                  data-weekend={weekend.includes(weekday(date, timeZone)) ? '' : undefined}
                  aria-selected={isSelected}
                  className="min-w-0 border-e border-b border-border/70 [&:nth-child(7)]:border-e-0"
                >
                  <button
                    type="button"
                    data-date={key}
                    tabIndex={sameDay(date, tabStop, timeZone) ? 0 : -1}
                    aria-label={`${formatFullDate(date, locale, timeZone)}${list.length ? `, ${t('calendar.events', { count: list.length })}` : ''}`}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => select(date)}
                    onKeyDown={(e) => onKeyDown(e, date)}
                    className={cn(
                      'flex h-full min-h-14 w-full flex-col items-stretch p-1.5 text-start transition-colors motion-reduce:transition-none sm:min-h-[92px] sm:p-2',
                      'hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                      inMonth ? 'bg-card' : 'bg-secondary/20',
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={cn(
                          'inline-flex size-6 items-center justify-center rounded-full text-[12px] font-medium tabular-nums',
                          isToday
                            ? 'bg-primary font-semibold text-primary-foreground'
                            : isSelected
                              ? 'bg-secondary text-foreground ring-1 ring-border'
                              : inMonth
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                        )}
                      >
                        {zonedParts(date, timeZone).day}
                      </span>
                      {isSelected && !isToday && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
                    </span>
                    {list.length > 0 && (
                      <span aria-hidden className="mt-1 flex gap-0.5 sm:hidden">
                        {list.slice(0, 3).map((e) => (
                          <span key={e.id} className={cn('size-1.5 rounded-full', TONE[kindOf(e, kinds).tone].dot)} />
                        ))}
                      </span>
                    )}
                    <span aria-hidden className="mt-1.5 hidden space-y-1 sm:block">
                      {list.slice(0, maxEventsPerDay).map((e) => (
                        <span key={e.id} className="flex min-w-0 items-center gap-1.5">
                          <span className={cn('size-1.5 shrink-0 rounded-full', TONE[kindOf(e, kinds).tone].dot)} />
                          <span className="truncate text-[11px] text-foreground/80">{e.title}</span>
                          <span className="ms-auto hidden shrink-0 font-mono text-[10px] text-muted-foreground xl:block">
                            {formatTime(e.start, clock.locale, clock.hourCycle, timeZone)}
                          </span>
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="block ps-3 text-[10.5px] text-muted-foreground">
                          + {t('common.more', { count: extra })}
                        </span>
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
