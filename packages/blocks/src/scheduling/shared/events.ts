import { CalendarCheck, Cog, Database, RefreshCw, ShieldCheck, Upload, type LucideIcon } from '@gntik-ai/icons';
import type { BadgeTone } from '@gntik-ai/ui';
import { dayKey } from './dates';

/** A scheduled item on a calendar. */
export interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** Key into the `kinds` map (job, deploy, review, backup, maintenance…). */
  kind?: string;
  /** Region, room or target, shown after the time. */
  location?: string;
}

export type EventTone = 'primary' | 'violet' | 'cyan' | 'amber' | 'neutral';

export interface EventKind {
  label: string;
  icon: LucideIcon;
  tone: EventTone;
}

/** Default kinds: brand green for jobs, categorical accents for the rest (never severity). */
export const defaultEventKinds: Record<string, EventKind> = {
  job: { label: 'Job', icon: RefreshCw, tone: 'primary' },
  deploy: { label: 'Deploy', icon: Upload, tone: 'violet' },
  review: { label: 'Review', icon: ShieldCheck, tone: 'cyan' },
  backup: { label: 'Backup', icon: Database, tone: 'amber' },
  maintenance: { label: 'Maintenance', icon: Cog, tone: 'neutral' },
};

const FALLBACK: EventKind = { label: 'Event', icon: CalendarCheck, tone: 'primary' };

export function kindOf(event: ScheduleEvent, kinds: Record<string, EventKind>): EventKind {
  return (event.kind ? kinds[event.kind] : undefined) ?? FALLBACK;
}

/** Token classes per tone. Text stays foreground on category tints (no contrast alias for them). */
export const TONE: Record<EventTone, { dot: string; soft: string; bar: string; icon: string; badge: BadgeTone }> = {
  primary: { dot: 'bg-primary', soft: 'bg-primary/12', bar: 'border-primary', icon: 'text-primary-text', badge: 'primary' },
  violet: { dot: 'bg-category-violet', soft: 'bg-category-violet/14', bar: 'border-category-violet', icon: 'text-foreground', badge: 'violet' },
  cyan: { dot: 'bg-category-cyan', soft: 'bg-category-cyan/14', bar: 'border-category-cyan', icon: 'text-foreground', badge: 'cyan' },
  amber: { dot: 'bg-category-amber', soft: 'bg-category-amber/16', bar: 'border-category-amber', icon: 'text-foreground', badge: 'amber' },
  neutral: { dot: 'bg-muted-foreground', soft: 'bg-secondary', bar: 'border-muted-foreground', icon: 'text-muted-foreground', badge: 'neutral' },
};

/** Events grouped by local day key, each day sorted by start. */
export function groupByDay(events: readonly ScheduleEvent[]): Map<string, ScheduleEvent[]> {
  const map = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const key = dayKey(e.start);
    const list = map.get(key);
    if (list) list.push(e);
    else map.set(key, [e]);
  }
  for (const list of map.values()) list.sort((a, b) => a.start.getTime() - b.start.getTime());
  return map;
}
