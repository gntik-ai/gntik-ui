import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn, useI18n } from '@gntik-ai/ui';
import { CalendarHeader } from '../shared/CalendarHeader';
import { addDays, addMonths, dayKey, formatFullDate, formatMonth, formatTime, formatWeekday, monthGrid, sameDay, sameMonth, startOfDay, startOfMonth, startOfWeek } from '../shared/dates';
import { defaultEventKinds, groupByDay, kindOf, TONE, type EventKind, type ScheduleEvent } from '../shared/events';
import { sampleEvents, sampleToday } from '../shared/fixtures';

export interface MonthCalendarProps {
  events?: ScheduleEvent[];
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

/** Monday-first weekdays (2026-01-05 is a Monday). */
const WEEK = Array.from({ length: 7 }, (_, i) => new Date(2026, 0, 5 + i));

/**
 * Month view of scheduled work: a Monday-first grid with up to N events per day.
 * Keyboard: arrows move by day/week, Home/End to the week edges, PageUp/PageDown by month,
 * Enter/Space selects.
 */
export function MonthCalendar({
  events = sampleEvents,
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
  const { t, locale, dir } = useI18n();
  const titleId = useId();
  const [selected, setSelected] = useState<Date>(() => startOfDay(defaultSelected ?? today));
  const [focused, setFocused] = useState<Date>(() => startOfDay(defaultSelected ?? defaultMonth ?? today));
  const [month, setMonth] = useState<Date>(() => startOfMonth(defaultMonth ?? defaultSelected ?? today));
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const byDay = useMemo(() => groupByDay(events), [events]);
  const weeks = monthGrid(month);
  // The roving tab stop stays inside the visible month.
  const tabStop = sameMonth(focused, month) ? focused : sameMonth(selected, month) ? selected : month;

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${dayKey(focused)}"]`)?.focus();
  }, [focused]);

  const showMonth = (next: Date) => {
    const first = startOfMonth(next);
    setMonth(first);
    onMonthChange?.(first);
  };

  const go = (date: Date) => {
    setFocused(date);
    if (!sameMonth(date, month)) showMonth(date);
    moveFocus.current = true;
  };

  const select = (date: Date) => {
    setSelected(date);
    setFocused(date);
    onSelectDate?.(date, byDay.get(dayKey(date)) ?? []);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const weekStart = startOfWeek(date);
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, dir === 'rtl' ? 1 : -1),
      ArrowRight: () => addDays(date, dir === 'rtl' ? -1 : 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6),
      PageUp: () => new Date(date.getFullYear(), date.getMonth() - 1, Math.min(date.getDate(), 28)),
      PageDown: () => new Date(date.getFullYear(), date.getMonth() + 1, Math.min(date.getDate(), 28)),
    };
    const next = map[event.key];
    if (!next) return;
    event.preventDefault();
    go(next());
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <CalendarHeader
        titleId={titleId}
        title={formatMonth(month, locale)}
        prevLabel={t('calendar.previousMonth')}
        nextLabel={t('calendar.nextMonth')}
        onPrev={() => showMonth(addMonths(month, -1))}
        onNext={() => showMonth(addMonths(month, 1))}
        onToday={() => {
          showMonth(today);
          setFocused(startOfDay(today));
        }}
        actions={actions}
      />
      <div ref={gridRef} role="grid" aria-labelledby={titleId}>
        <div role="row" className="grid grid-cols-7 border-b border-border bg-secondary/30">
          {WEEK.map((day) => (
            <div
              key={day.getDay()}
              role="columnheader"
              aria-label={formatWeekday(day, locale, 'long')}
              className="py-2 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
            >
              {formatWeekday(day, locale)}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={dayKey(week[0] ?? month)} role="row" className="grid grid-cols-7">
            {week.map((date) => {
              const key = dayKey(date);
              const list = byDay.get(key) ?? [];
              const inMonth = sameMonth(date, month);
              const isToday = sameDay(date, today);
              const isSelected = sameDay(date, selected);
              const extra = list.length - maxEventsPerDay;
              return (
                <div key={key} role="gridcell" aria-selected={isSelected} className="min-w-0 border-e border-b border-border/70 [&:nth-child(7)]:border-e-0">
                  <button
                    type="button"
                    data-date={key}
                    tabIndex={sameDay(date, tabStop) ? 0 : -1}
                    aria-label={`${formatFullDate(date, locale)}${list.length ? `, ${t('calendar.events', { count: list.length })}` : ''}`}
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
                        {date.getDate()}
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
                          <span className="ms-auto hidden shrink-0 font-mono text-[10px] text-muted-foreground xl:block">{formatTime(e.start, locale)}</span>
                        </span>
                      ))}
                      {extra > 0 && <span className="block ps-3 text-[10.5px] text-muted-foreground">+ {t('common.more', { count: extra })}</span>}
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
