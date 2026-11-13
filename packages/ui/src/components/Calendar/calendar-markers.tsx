import type { ReactNode } from 'react';
import { isSameDay } from './calendar-utils';
import { calendarVariants } from './calendar.variants';

const s = calendarVariants();

export type CalendarMarkerTone = 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'neutral';

export interface CalendarDayMarker {
  /** Announced as part of the day's accessible name. */
  label: string;
  /** Token tone of the dot. Defaults to `'primary'`. */
  tone?: CalendarMarkerTone;
}

export interface CalendarDayState {
  selected: boolean;
  today: boolean;
  disabled: boolean;
  inRange: boolean;
  markers: readonly CalendarDayMarker[];
}

/** Dots drawn per day; every marker still contributes to the accessible name. */
const MAX_DOTS = 3;
const NO_MARKERS: readonly CalendarDayMarker[] = [];

interface MarkerSources {
  loading: boolean;
  highlightedDates?: readonly Date[];
  highlightedLabel: string;
  getDayMarkers?: (date: Date) => readonly CalendarDayMarker[] | undefined;
}

/** Markers of one in-month day: the highlighted dot first, then `getDayMarkers`. None while loading. */
export function resolveDayMarkers(
  date: Date,
  { loading, highlightedDates, highlightedLabel, getDayMarkers }: MarkerSources,
) {
  if (loading || (!highlightedDates?.length && !getDayMarkers)) return NO_MARKERS;
  const highlighted = highlightedDates?.some((d) => isSameDay(d, date))
    ? [{ label: highlightedLabel, tone: 'primary' } satisfies CalendarDayMarker]
    : [];
  const markers = [...highlighted, ...(getDayMarkers?.(date) ?? [])];
  return markers.length ? markers : NO_MARKERS;
}

/** Day button name: the day label followed by every marker label. */
export function markedDayLabel(dayLabel: string, markers: readonly CalendarDayMarker[]) {
  return markers.length ? [dayLabel, ...markers.map((m) => m.label)].join(', ') : dayLabel;
}

export function hasDayDecoration(markers: readonly CalendarDayMarker[], renderDay: unknown) {
  return markers.length > 0 || !!renderDay;
}

export interface CalendarDayContentProps {
  date: Date;
  state: CalendarDayState;
  renderDay?: (date: Date, state: CalendarDayState) => ReactNode;
}

/** Content of a day button: the number and dots, or the decorative `renderDay` output. */
export function CalendarDayContent({ date, state, renderDay }: CalendarDayContentProps) {
  if (renderDay) return <span aria-hidden="true">{renderDay(date, state)}</span>;
  return (
    <>
      {date.getDate()}
      {state.markers.length > 0 && (
        <span className={s.markers()}>
          {state.markers.slice(0, MAX_DOTS).map((marker, i) => (
            <span
              key={i}
              data-marker=""
              aria-hidden="true"
              className={s.marker({ tone: state.selected ? 'selected' : (marker.tone ?? 'primary') })}
            />
          ))}
        </span>
      )}
    </>
  );
}
