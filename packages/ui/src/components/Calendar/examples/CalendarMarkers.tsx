import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { toISODate } from '../calendar-utils';
import { Calendar, type CalendarDayMarker } from '../Calendar';

const today = new Date(2026, 2, 10);

interface DayRuns {
  failed?: number;
  passed?: number;
  maintenance?: boolean;
  review?: boolean;
}

/** Per-month run history, keyed by YYYY-MM-DD: what an app would fetch in onMonthChange. */
function loadMonth(month: Date): Record<string, DayRuns> {
  const day = (d: number) => toISODate(new Date(month.getFullYear(), month.getMonth(), d));
  return {
    [day(3)]: { failed: 2 },
    [day(5)]: { passed: 8 },
    [day(12)]: { passed: 5, failed: 1 },
    [day(18)]: { maintenance: true },
    [day(24)]: { passed: 3, failed: 1, maintenance: true, review: true },
  };
}

/** Tone-coded run outcomes per day, a month of data that loads on paging, and a custom day cell. */
export default function CalendarMarkers() {
  const { t } = useI18n();
  const [month, setMonth] = useState(() => new Date(2026, 2, 1));
  const [loaded, setLoaded] = useState<{ month: string; runs: Record<string, DayRuns> } | null>(() => ({
    month: toISODate(new Date(2026, 2, 1)),
    runs: loadMonth(new Date(2026, 2, 1)),
  }));
  const loading = loaded?.month !== toISODate(month);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoaded({ month: toISODate(month), runs: loadMonth(month) }), 600);
    return () => clearTimeout(timer);
  }, [loading, month]);

  const runs = loaded?.runs;
  const getDayMarkers = useCallback(
    (date: Date): CalendarDayMarker[] | undefined => {
      const day = runs?.[toISODate(date)];
      if (!day) return undefined;
      const markers: CalendarDayMarker[] = [];
      if (day.failed) {
        markers.push({ label: t('calendar.examples.markers.failed', { count: day.failed }), tone: 'destructive' });
      }
      if (day.passed) {
        markers.push({ label: t('calendar.examples.markers.passed', { count: day.passed }), tone: 'success' });
      }
      if (day.maintenance) markers.push({ label: t('calendar.examples.markers.maintenance'), tone: 'warning' });
      if (day.review) markers.push({ label: t('calendar.examples.markers.review'), tone: 'info' });
      return markers;
    },
    [runs, t],
  );
  const highlighted = useMemo(() => [new Date(2026, 2, 10)], []);

  return (
    <div className="flex flex-wrap gap-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('calendar.examples.markers')}</p>
        <Calendar
          aria-label={t('calendar.examples.markers')}
          locale="en-US"
          weekStartsOn={1}
          today={today}
          month={month}
          onMonthChange={setMonth}
          loading={loading}
          highlightedDates={highlighted}
          getDayMarkers={getDayMarkers}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('calendar.examples.markers.renderDay')}</p>
        <Calendar
          aria-label={t('calendar.examples.markers.renderDay')}
          locale="en-US"
          weekStartsOn={1}
          today={today}
          getDayMarkers={getDayMarkers}
          renderDay={(date, state) => (
            <span className="flex flex-col items-center leading-none">
              <span>{date.getDate()}</span>
              <span className="font-mono text-[9px] text-muted-foreground">{state.markers.length || ''}</span>
            </span>
          )}
        />
      </div>
    </div>
  );
}
