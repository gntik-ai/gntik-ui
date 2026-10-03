import { Avatar, Button, cn, Timestamp, toDate, type DateInput } from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { PROJECT_ACTIVITY } from './fixtures';

export interface ActivityItem {
  id: string;
  actor: { name: string; src?: string };
  /** Verb phrase ("deployed", "invited"). */
  action: string;
  /** Object of the action, emphasised ("orders-api v2.14.0"). */
  target?: string;
  at: DateInput;
}

export interface ActivityFeedProps {
  /** Items, newest first. */
  items?: readonly ActivityItem[];
  /** Accessible name of the feed. */
  label?: string;
  /** Reference "now" for the Today / Yesterday headings (defaults to the mount time). */
  now?: DateInput;
  locale?: string;
  /** Shows a "Load more" button. */
  onLoadMore?: () => void;
  loadingMore?: boolean;
  /** Heading level of the day-group titles, to fit the page outline (default h3). */
  groupHeadingAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

interface DayGroup {
  key: string;
  label: string;
  items: ActivityItem[];
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Groups items by calendar day (local time), labelled Today, Yesterday or the date. */
export function groupActivityByDay(items: readonly ActivityItem[], now: Date, locale?: string): DayGroup[] {
  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric' });
  const groups: DayGroup[] = [];
  for (const item of items) {
    const date = toDate(item.at);
    if (!date) continue;
    const key = dayKey(date);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: key === today ? 'Today' : key === yesterday ? 'Yesterday' : fmt.format(date), items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

/** Activity feed: actor avatar, action, target and Timestamp, grouped by day. */
export function ActivityFeed({ items = PROJECT_ACTIVITY, label = 'Recent activity', now, locale, onLoadMore, loadingMore, groupHeadingAs: GroupTag = 'h3', className }: ActivityFeedProps) {
  const [mountedAt] = useState(() => Date.now());
  const reference = toDate(now ?? mountedAt) ?? new Date(mountedAt);
  const groups = groupActivityByDay(items, reference, locale);
  const id = useId();
  return (
    <section aria-label={label} className={cn('flex flex-col gap-6', className)}>
      {groups.map((group) => {
        const headingId = `${id}-${group.key}`;
        return (
          <div key={group.key}>
            <GroupTag id={headingId} className="mb-3 font-mono text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              {group.label}
            </GroupTag>
            <ul aria-labelledby={headingId} className="flex flex-col">
              {group.items.map((item, i) => (
                <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < group.items.length - 1 && <span aria-hidden className="absolute top-7 bottom-0.5 left-[11.5px] w-px bg-border" />}
                  <Avatar name={item.actor.name} src={item.actor.src} size="xs" className="mt-0.5" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <p className="min-w-0 text-[13px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.actor.name}</span> {item.action}
                      {item.target && (
                        <>
                          {' '}
                          <span className="font-medium text-foreground">{item.target}</span>
                        </>
                      )}
                    </p>
                    <Timestamp value={item.at} locale={locale} className="shrink-0 font-mono text-[11px]" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {onLoadMore && (
        <Button variant="secondary" size="sm" className="self-start" loading={loadingMore} onClick={onLoadMore}>
          Load more
        </Button>
      )}
    </section>
  );
}
