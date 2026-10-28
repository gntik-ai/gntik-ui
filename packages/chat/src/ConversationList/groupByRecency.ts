import type { ConversationGrouping, ConversationSummary } from './types';

export type RecencyKey = 'today' | 'yesterday' | 'previous7Days' | 'older';
const ORDER: RecencyKey[] = ['today', 'yesterday', 'previous7Days', 'older'];

// Calendar dates, rather than elapsed milliseconds, keep midnight and DST boundaries local.
const calendarDay = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;

export function groupByRecency(value: ConversationSummary['updatedAt'], now: Date): RecencyKey {
  const days = calendarDay(now) - calendarDay(new Date(value));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return days < 7 ? 'previous7Days' : 'older';
}

export function conversationGroups(items: ConversationSummary[], groupBy: ConversationGrouping, now: Date) {
  const groups = new Map<string, ConversationSummary[]>();
  for (const item of items) {
    const key =
      groupBy === false ? '' : typeof groupBy === 'function' ? groupBy(item) : groupByRecency(item.updatedAt, now);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  const keys = groupBy === 'recency' ? ORDER.filter((key) => groups.has(key)) : [...groups.keys()];
  return keys.map((key) => ({ key, items: groups.get(key) ?? [] }));
}
