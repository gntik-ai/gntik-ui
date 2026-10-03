import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@gntik-ai/ui';
import { CalendarHeader } from '../shared/CalendarHeader';
import { addDays, dayKey, formatDay, formatRange, formatTime, formatWeekday, formatWeekRange, hourOf, sameDay, startOfWeek, weekDays } from '../shared/dates';
import { defaultEventKinds, groupByDay, kindOf, TONE, type EventKind, type ScheduleEvent } from '../shared/events';
import { sampleEvents, sampleToday } from '../shared/fixtures';

export interface WeekCalendarProps {
  events?: ScheduleEvent[];
  /** The app's "today" (the block never reads the clock). */
  today?: Date;
  /** Current time for the "now" line, shown when it falls in the visible week. Defaults to `today`. */
  now?: Date;
  /** A date inside the week shown first (uncontrolled). Defaults to `today`. */
  defaultWeek?: Date;
  /** Called with the Monday of the newly shown week. */
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
const pad = (n: number) => String(n).padStart(2, '0');

interface Placed {
  event: ScheduleEvent;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

/** Side-by-side lanes for overlapping events within one day. */
function layoutDay(list: readonly ScheduleEvent[], hourHeight: number): Placed[] {
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
    const start = hourOf(event.start);
    const end = Math.max(sameDay(event.start, event.end) ? hourOf(event.end) : 24, start + 0.25);
    if (start >= clusterEnd) close();
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else laneEnds[lane] = end;
    clusterEnd = Math.max(clusterEnd, end);
    const p: Placed = { event, top: start * hourHeight + 1, height: Math.max((end - start) * hourHeight - 2, 18), lane, lanes: 1 };
    cluster.push(p);
    placed.push(p);
  }
  close();
  return placed;
}

/** Week view: seven day columns over a scrolling 24-hour time grid, with a "now" line. */
export function WeekCalendar({
  events = sampleEvents,
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
  const titleId = useId();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(defaultWeek ?? today));
  const scrollRef = useRef<HTMLDivElement>(null);
  const byDay = useMemo(() => groupByDay(events), [events]);
  const days = weekDays(weekStart);
  const nowAt = now ?? today;
  const nowVisible = days.some((d) => sameDay(d, nowAt));

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
        titleId={titleId}
        title={formatWeekRange(days)}
        prevLabel="Previous week"
        nextLabel="Next week"
        onPrev={() => show(addDays(weekStart, -7))}
        onNext={() => show(addDays(weekStart, 7))}
        onToday={() => show(startOfWeek(today))}
        actions={actions}
      />
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div aria-hidden className="flex border-b border-border">
            <div className="w-14 shrink-0 border-r border-border/70" />
            <div className="grid flex-1 grid-cols-7">
              {days.map((d) => {
                const isToday = sameDay(d, today);
                return (
                  <div key={dayKey(d)} className="flex flex-col items-center justify-center border-l border-border/70 py-2 first:border-l-0">
                    <span className="text-[11px] text-muted-foreground">{formatWeekday(d)}</span>
                    <span
                      className={cn(
                        'mt-1 inline-flex size-7 items-center justify-center rounded-full text-[13px] tabular-nums',
                        isToday ? 'bg-primary font-semibold text-primary-foreground' : 'font-medium text-foreground',
                      )}
                    >
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div ref={scrollRef} tabIndex={0} role="region" aria-labelledby={titleId} className="overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring" style={{ maxHeight: height }}>
            <div className="relative flex" style={{ height: 24 * hourHeight }}>
              <div aria-hidden className="relative w-14 shrink-0 border-r border-border/70">
                {HOURS.slice(1).map((h) => (
                  <span key={h} className="absolute right-2 font-mono text-[10px] text-muted-foreground" style={{ top: h * hourHeight - 6 }}>
                    {pad(h)}:00
                  </span>
                ))}
              </div>
              <div className="relative flex-1">
                <div aria-hidden className="absolute inset-0">
                  {HOURS.map((h) => (
                    <div key={h} className="border-t border-border/70 first:border-t-0" style={{ height: hourHeight }} />
                  ))}
                </div>
                <div className="relative grid h-full grid-cols-7">
                  {days.map((d) => {
                    const list = byDay.get(dayKey(d)) ?? [];
                    return (
                      <ul key={dayKey(d)} aria-label={formatDay(d)} className="relative border-l border-border/70 first:border-l-0">
                        {layoutDay(list, hourHeight).map(({ event, top, height: h, lane, lanes }) => {
                          const kind = kindOf(event, kinds);
                          const tone = TONE[kind.tone];
                          const range = formatRange(event.start, event.end);
                          const body = (
                            <>
                              <span className="block truncate text-[11px] leading-tight font-semibold text-foreground">{event.title}</span>
                              <span className="block truncate font-mono text-[10px] text-muted-foreground">{formatTime(event.start)}</span>
                            </>
                          );
                          const box = cn('block h-full w-full overflow-hidden rounded-md border-l-2 px-2 py-1 text-left', tone.soft, tone.bar);
                          return (
                            <li
                              key={event.id}
                              className="absolute px-0.5"
                              style={{ top, height: h, left: `${(lane / lanes) * 100}%`, width: `${100 / lanes}%` }}
                            >
                              {onEventClick ? (
                                <button
                                  type="button"
                                  aria-label={`${event.title}, ${range}${event.location ? `, ${event.location}` : ''}`}
                                  onClick={() => onEventClick(event)}
                                  className={cn(box, 'transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring motion-reduce:transition-none')}
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
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: hourOf(nowAt) * hourHeight }}>
                    <span className="-ml-1 size-2 shrink-0 rounded-full bg-primary" />
                    <span className="h-px flex-1 bg-primary" />
                    <span className="shrink-0 rounded bg-primary px-1 font-mono text-[9px] text-primary-foreground">now</span>
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
