import { useId, useMemo } from 'react';
import { Badge, EmptyState, cn, useI18n } from '@gntik-ai/ui';
import { CalendarDays, ChevronRight, Clock } from '@gntik-ai/icons';
import { EventTile } from '../shared/EventTile';
import { addDays, dayKey, formatDay, formatRange, sameDay } from '../shared/dates';
import { defaultEventKinds, groupByDay, kindOf, TONE, type EventKind, type ScheduleEvent } from '../shared/events';
import { sampleEvents, sampleToday } from '../shared/fixtures';

export interface AgendaListProps {
  events?: ScheduleEvent[];
  /** The app's "today": labels the Today/Tomorrow groups. */
  today?: Date;
  /** Only events on or after this day. Defaults to `today`; pass null for all. */
  from?: Date | null;
  /** Number of days shown from `from`. Default 7; null for no limit. */
  days?: number | null;
  /** Makes each row a button. */
  onEventClick?: (event: ScheduleEvent) => void;
  kinds?: Record<string, EventKind>;
  title?: string;
  /** Max height of the scrolling list in px. */
  maxHeight?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Heading level of the title, to fit the page outline (default h3); inner headings use the next level. */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/** Upcoming scheduled work grouped by day, each row with a kind tile, time range and location. */
export function AgendaList({
  events = sampleEvents,
  today = sampleToday,
  from,
  days = 7,
  onEventClick,
  kinds = defaultEventKinds,
  title: titleProp,
  maxHeight,
  emptyTitle: emptyTitleProp,
  emptyDescription: emptyDescriptionProp,
  titleAs: TitleTag = 'h3',
  className,
}: AgendaListProps) {
  const { t, locale } = useI18n();
  const title = titleProp ?? t('calendar.agenda');
  const emptyTitle = emptyTitleProp ?? t('calendar.emptyTitle');
  const emptyDescription = emptyDescriptionProp ?? t('calendar.emptyDescription');
  const SubTag = TitleTag === 'h2' ? 'h3' : TitleTag === 'h3' ? 'h4' : 'h5';
  const uid = useId();
  const start = from === undefined ? today : from;
  const groups = useMemo(() => {
    const first = start ? dayKey(start) : null;
    const last = start && days != null ? dayKey(addDays(start, days - 1)) : null;
    return [...groupByDay(events).entries()]
      .filter(([key]) => (first == null || key >= first) && (last == null || key <= last))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [events, start, days]);

  const dayLabel = (d: Date) => {
    if (sameDay(d, today)) return `${t('calendar.today')} · ${formatDay(d, locale)}`;
    if (sameDay(d, addDays(today, 1))) return `${t('calendar.tomorrow')} · ${formatDay(d, locale)}`;
    return formatDay(d, locale);
  };

  return (
    <section aria-label={title} className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <TitleTag className="text-[15px] font-semibold tracking-tight text-foreground">{title}</TitleTag>
        <span className="font-mono text-[11px] text-muted-foreground">
          {groups.reduce((n, [, list]) => n + list.length, 0)} scheduled
        </span>
      </div>
      {groups.length === 0 ? (
        <EmptyState icon={CalendarDays} title={emptyTitle} titleAs={TitleTag === 'h2' ? 'h3' : 'h4'} description={emptyDescription} className="py-12" />
      ) : (
        <div
          style={maxHeight ? { maxHeight } : undefined}
          tabIndex={maxHeight ? 0 : undefined}
          role={maxHeight ? 'region' : undefined}
          aria-label={maxHeight ? `${title} list` : undefined}
          className="overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring">
          {groups.map(([key, list]) => {
            const first = list[0];
            if (!first) return null;
            const headingId = `${uid}-${key}`;
            return (
              <div key={key}>
                <SubTag
                  id={headingId}
                  className="border-b border-border bg-secondary/30 px-4 py-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase sm:px-5"
                >
                  {dayLabel(first.start)}
                </SubTag>
                <ul aria-labelledby={headingId} className="divide-y divide-border border-b border-border last:border-b-0">
                  {list.map((event) => {
                    const kind = kindOf(event, kinds);
                    const range = formatRange(event.start, event.end, locale);
                    const content = (
                      <>
                        <EventTile kind={kind} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-foreground">{event.title}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[11.5px] text-muted-foreground">
                            <Clock size={12} aria-hidden className="shrink-0" />
                            <span>{range}</span>
                            {event.location && (
                              <>
                                <span aria-hidden>·</span>
                                <span className="truncate">{event.location}</span>
                              </>
                            )}
                          </span>
                        </span>
                        <Badge tone={TONE[kind.tone].badge} size="sm" className="hidden sm:inline-flex">
                          {kind.label}
                        </Badge>
                      </>
                    );
                    const row = 'flex w-full items-center gap-3.5 px-4 py-3 text-start sm:px-5';
                    return (
                      <li key={event.id}>
                        {onEventClick ? (
                          <button
                            type="button"
                            onClick={() => onEventClick(event)}
                            className={cn(
                              row,
                              'group transition-colors hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none',
                            )}
                          >
                            {content}
                            <ChevronRight size={16} aria-hidden className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground rtl:-scale-x-100" />
                          </button>
                        ) : (
                          <div className={row}>{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
