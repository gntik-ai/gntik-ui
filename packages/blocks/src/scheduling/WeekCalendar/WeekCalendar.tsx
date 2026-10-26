import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn, useI18n, zonedParts, localeWeekStart, type WeekDay } from '@gntik-ai/ui';
import { useSchedulingClock } from '../shared/useSchedulingClock';
import { CalendarHeader } from '../shared/CalendarHeader';
import {
  type HourCycle,
  weekday,
  formatHour,
  addDays,
  dayKey,
  formatDay,
  formatRange,
  formatTime,
  formatWeekday,
  formatWeekRange,
  hourOf,
  sameDay,
  startOfWeek,
  weekDays,
  weekendDays,
} from '../shared/dates';
import { defaultEventKinds, groupByDay, kindOf, TONE, type EventKind, type ScheduleEvent } from '../shared/events';
import { sampleEvents, sampleToday } from '../shared/fixtures';

export interface WeekCalendarProps {
  events?: ScheduleEvent[];
  /** Display time zone; defaults to the I18nProvider zone (system outside a provider). */
  timeZone?: string;
  /** First weekday; defaults to the provider or runtime locale. */
  weekStartsOn?: WeekDay;
  /** Clock used for events and hour labels; defaults to the provider or runtime locale. */
  hourCycle?: HourCycle;
  /** The app's "today" (the block never reads the clock). */
  today?: Date;
  /** Current time for the "now" line, shown when it falls in the visible week. Defaults to `today`. */
  now?: Date;
  /** A date inside the week shown first (uncontrolled). Defaults to `today`. */
  defaultWeek?: Date;
  /** Called with the first day of the newly shown week. */
  onWeekChange?: (weekStart: Date) => void;
  /** Makes events buttons. */
  onEventClick?: (event: ScheduleEvent) => void;
  kinds?: Record<string, EventKind>;
  /** Hour the grid scrolls to on mount. */
  scrollToHour?: number;
  /** Pixels per hour. */
  hourHeight?: number;
  /** Max height of the scrolling time grid in px. */
  height?: number;
  actions?: ReactNode;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

interface Placed {
  event: ScheduleEvent;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

/** Side-by-side lanes for overlapping events within one day. */
function layoutDay(list: readonly ScheduleEvent[], hourHeight: number, timeZone: string): Placed[] {
  const placed: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = -1;
  let laneEnds: number[] = [];
  const close = () => {
    for (const p of cluster) p.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };
  for (const event of list) {
    const start = hourOf(event.start, timeZone);
    const end = Math.max(sameDay(event.start, event.end, timeZone) ? hourOf(event.end, timeZone) : 24, start + 0.25);
    if (start >= clusterEnd) close();
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else laneEnds[lane] = end;
    clusterEnd = Math.max(clusterEnd, end);
    const p: Placed = {
      event,
      top: start * hourHeight + 1,
      height: Math.max((end - start) * hourHeight - 2, 18),
      lane,
      lanes: 1,
    };
    cluster.push(p);
    placed.push(p);
  }
  close();
  return placed;
}

/** Week view: seven day columns over a scrolling 24-hour time grid, with a "now" line. */
export function WeekCalendar({
  events = sampleEvents,
  timeZone: timeZoneProp,
  weekStartsOn: weekStartsOnProp,
  hourCycle: hourCycleProp,
  today = sampleToday,
  now,
  defaultWeek,
  onWeekChange,
  onEventClick,
  kinds = defaultEventKinds,
  scrollToHour = 7,
  hourHeight = 52,
  height = 480,
  actions,
  className,
}: WeekCalendarProps) {
  const { t, locale, timeZone: providerZone } = useI18n();
  const timeZone = timeZoneProp ?? providerZone;
  const clock = useSchedulingClock(hourCycleProp);
  const weekStartsOn = weekStartsOnProp ?? localeWeekStart(clock.locale);
  const titleId = useId();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(defaultWeek ?? today, weekStartsOn, timeZone));
  const scrollRef = useRef<HTMLDivElement>(null);
  const byDay = useMemo(() => groupByDay(events, timeZone), [events, timeZone]);
  const days = weekDays(weekStart, weekStartsOn, timeZone);
  const visibleStart = days[0] ?? weekStart;
  const weekend = weekendDays(clock.locale);
  const nowAt = now ?? today;
  const nowVisible = days.some((d) => sameDay(d, nowAt, timeZone));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(scrollToHour * hourHeight - 8, 0);
  }, [scrollToHour, hourHeight]);

  const show = (start: Date) => {
    setWeekStart(start);
    onWeekChange?.(start);
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <CalendarHeader
        timeZone={timeZone}
        referenceDate={visibleStart}
        titleId={titleId}
        title={formatWeekRange(days, locale, timeZone)}
        prevLabel={t('calendar.previousWeek')}
        nextLabel={t('calendar.nextWeek')}
        onPrev={() => show(addDays(visibleStart, -7, timeZone))}
        onNext={() => show(addDays(visibleStart, 7, timeZone))}
        onToday={() => show(startOfWeek(today, weekStartsOn, timeZone))}
        actions={actions}
      />
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div aria-hidden className="flex border-b border-border">
            <div className="w-14 shrink-0 border-e border-border/70" />
            <div className="grid flex-1 grid-cols-7">
              {days.map((d) => {
                const isToday = sameDay(d, today, timeZone);
                return (
                  <div
                    key={dayKey(d, timeZone)}
                    className="flex flex-col items-center justify-center border-s border-border/70 py-2 first:border-s-0"
                  >
                    <span className="text-[11px] text-muted-foreground">
                      {formatWeekday(d, locale, 'short', timeZone)}
                    </span>
                    <span
                      className={cn(
                        'mt-1 inline-flex size-7 items-center justify-center rounded-full text-[13px] tabular-nums',
                        isToday ? 'bg-primary font-semibold text-primary-foreground' : 'font-medium text-foreground',
                      )}
                    >
                      {zonedParts(d, timeZone).day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            ref={scrollRef}
            tabIndex={0}
            role="region"
            aria-labelledby={timeZone === 'system' ? titleId : `${titleId} ${titleId}-zone`}
            className="overflow-y-auto focus-ring-inset"
            style={{ maxHeight: height }}
          >
            <div className="relative flex" style={{ height: 24 * hourHeight }}>
              <div aria-hidden className="relative w-14 shrink-0 border-e border-border/70">
                {HOURS.slice(1).map((h) => (
                  <span
                    key={h}
                    className="absolute end-2 font-mono text-[10px] text-muted-foreground"
                    style={{ top: h * hourHeight - 6 }}
                  >
                    {formatHour(h, clock.locale, clock.hourCycle)}
                  </span>
                ))}
              </div>
              <div className="relative flex-1">
                <div aria-hidden className="absolute inset-0">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="border-t border-border/70 first:border-t-0"
                      style={{ height: hourHeight }}
                    />
                  ))}
                </div>
                <div className="relative grid h-full grid-cols-7">
                  {days.map((d) => {
                    const list = byDay.get(dayKey(d, timeZone)) ?? [];
                    return (
                      <ul
                        key={dayKey(d, timeZone)}
                        data-weekend={weekend.includes(weekday(d, timeZone)) ? '' : undefined}
                        aria-label={formatDay(d, locale, timeZone)}
                        className="relative border-s border-border/70 first:border-s-0"
                      >
                        {layoutDay(list, hourHeight, timeZone).map(({ event, top, height: h, lane, lanes }) => {
                          const kind = kindOf(event, kinds);
                          const tone = TONE[kind.tone];
                          const range = formatRange(event.start, event.end, clock.locale, clock.hourCycle, timeZone);
                          const body = (
                            <>
                              <span className="block truncate text-[11px] leading-tight font-semibold text-foreground">
                                {event.title}
                              </span>
                              <span className="block truncate font-mono text-[10px] text-foreground">
                                {formatTime(event.start, clock.locale, clock.hourCycle, timeZone)}
                              </span>
                            </>
                          );
                          const box = cn(
                            'block h-full w-full overflow-hidden rounded-md border-s-2 px-2 py-1 text-start',
                            tone.soft,
                            tone.bar,
                          );
                          return (
                            <li
                              key={event.id}
                              className="absolute px-0.5"
                              style={{
                                top,
                                height: h,
                                insetInlineStart: `${(lane / lanes) * 100}%`,
                                width: `${100 / lanes}%`,
                              }}
                            >
                              {onEventClick ? (
                                <button
                                  type="button"
                                  aria-label={`${event.title}, ${range}${event.location ? `, ${event.location}` : ''}`}
                                  onClick={() => onEventClick(event)}
                                  className={cn(
                                    box,
                                    'transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring motion-reduce:transition-none',
                                  )}
                                >
                                  {body}
                                </button>
                              ) : (
                                <div className={box} title={`${event.title} · ${range}`}>
                                  {body}
                                  <span className="sr-only">, {range}</span>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })}
                </div>
                {nowVisible && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 z-raised flex items-center"
                    style={{ top: hourOf(nowAt, timeZone) * hourHeight }}
                  >
                    <span className="-ms-1 size-2 shrink-0 rounded-full bg-primary" />
                    <span className="h-px flex-1 bg-primary" />
                    <span className="shrink-0 rounded bg-primary px-1 font-mono text-[9px] text-primary-foreground">
                      {t('calendar.now')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
