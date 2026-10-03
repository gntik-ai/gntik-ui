import { Button, StatusDot, Timestamp, type DateInput, type StatusDotTone } from '@gntik-ai/ui';
import { useState } from 'react';
import { DEPLOYMENT_EVENTS } from './fixtures';

export interface StatusEvent {
  id: string;
  /** Short state name next to the dot ("Running"). */
  status: string;
  tone: StatusDotTone;
  title: string;
  description?: string;
  at: DateInput;
  /** Who or what caused the change. */
  actor?: string;
  /** Pulses the dot (the current, in-progress state). */
  live?: boolean;
}

export interface StatusTimelineProps {
  /** Events, newest first. */
  events?: readonly StatusEvent[];
  /** Accessible name of the list. */
  label?: string;
  /** Events shown before "Show earlier"; all when omitted. */
  maxVisible?: number;
  /** `relative` ("3 hours ago") or `absolute` timestamps. */
  timeFormat?: 'relative' | 'absolute';
  className?: string;
}

/** Vertical timeline of state changes: a StatusDot per state, title, details and a Timestamp. */
export function StatusTimeline({ events = DEPLOYMENT_EVENTS, label = 'Status history', maxVisible, timeFormat = 'relative', className }: StatusTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const limit = !expanded && maxVisible !== undefined ? maxVisible : events.length;
  const shown = events.slice(0, limit);
  const hidden = events.length - shown.length;
  return (
    <div className={className}>
      <ol aria-label={label} className="flex flex-col">
        {shown.map((event, i) => {
          const last = i === shown.length - 1;
          return (
            <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
              {!last && <span aria-hidden className="absolute top-5 bottom-0 left-[9px] w-px bg-border" />}
              <span className="relative z-10 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-card">
                <StatusDot tone={event.tone} pulse={event.live} size="lg" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <p className="text-[13px] text-foreground">
                    <span className="font-semibold">{event.status}</span>
                    <span className="text-muted-foreground"> · </span>
                    {event.title}
                  </p>
                  <Timestamp value={event.at} format={timeFormat} className="shrink-0 font-mono text-[11px]" />
                </div>
                {(event.description || event.actor) && (
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {event.description}
                    {event.description && event.actor && ' '}
                    {event.actor && <span>by {event.actor}</span>}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {(hidden > 0 || (expanded && maxVisible !== undefined && events.length > maxVisible)) && (
        <Button variant="ghost" size="sm" className="mt-3 ml-6" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show fewer' : `Show ${hidden} earlier ${hidden === 1 ? 'event' : 'events'}`}
        </Button>
      )}
    </div>
  );
}
