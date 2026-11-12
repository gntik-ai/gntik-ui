import { foldText } from '../../utils/match-text';
import type { ComponentType } from 'react';

export type CommandIcon = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface CommandItem {
  /** Unique within the palette. */
  id: string;
  label: string;
  icon?: CommandIcon;
  /** Secondary line under the label. Also searched (with lower weight). */
  description?: string;
  /** Shortcut hint shown as keys, e.g. ['⌘', 'D'] or ['G', 'P']. Display only. */
  shortcut?: string[];
  /** Extra search terms (synonyms, ids). */
  keywords?: string[];
  /** Render the label in the mono face (identifiers, slugs). */
  mono?: boolean;
  disabled?: boolean;
  /** Runs when the item is chosen (click or Enter). The palette then closes. */
  onSelect?: () => void;
}

export interface CommandGroup {
  /** Group heading. */
  label: string;
  items: CommandItem[];
}

/** One row in the rendered list (recent items get their own key so ids can repeat across groups). */
export interface CommandEntry {
  key: string;
  item: CommandItem;
}

export interface CommandEntryGroup {
  value: string;
  items: CommandEntry[];
}

const BOUNDARY = /[\s\-_./:]/;

/** Scores one search token against a text: prefix > word start > substring > subsequence. -1 = no match. */
function scoreToken(text: string, token: string): number {
  const t = text;
  const idx = t.indexOf(token);
  if (idx === 0) return 100;
  if (idx > 0) return BOUNDARY.test(t.charAt(idx - 1)) ? 80 : 60;
  let from = 0;
  let last = -1;
  let gaps = 0;
  for (const ch of token) {
    const found = t.indexOf(ch, from);
    if (found === -1) return -1;
    if (last >= 0) gaps += found - last - 1;
    last = found;
    from = found + 1;
  }
  return Math.max(1, 40 - gaps * 2);
}

/**
 * Fuzzy-ish relevance of an item for a query: every whitespace-separated token must match the
 * label, a keyword or the description (weighted lower). Returns -1 when it does not match.
 */
export function scoreCommand(item: CommandItem, query: string, locale?: string): number {
  const tokens = foldText(query.trim(), locale).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  const label = foldText(item.label, locale);
  const keywords = (item.keywords ?? []).map((k) => foldText(k, locale));
  const description = item.description ? foldText(item.description, locale) : '';
  let total = 0;
  for (const token of tokens) {
    const best = Math.max(
      scoreToken(label, token),
      ...keywords.map((k) => scoreToken(k, token) * 0.9),
      description ? scoreToken(description, token) * 0.5 : -1,
    );
    if (best < 0) return -1;
    total += best;
  }
  return total;
}

export interface FilterCommandOptions {
  /** Replaces `scoreCommand`, also for an empty query: below 0 hides the item, higher scores come first, ties keep the given order. */
  score?: (item: CommandItem, query: string) => number;
  /** Renders at most this many rows in display order across groups (recent included). */
  limit?: number;
}

export interface FilteredCommandGroups {
  groups: CommandEntryGroup[];
  /** Rows before `limit` cut them. */
  total: number;
}

/**
 * Builds the visible groups: with an empty query (and no custom scorer), recent items first then every
 * group as given; otherwise only matching items, best first within each group, and empty groups dropped. Also
 * reports how many rows matched before the optional `limit` cut them.
 */
export function filterCommandGroupsWithTotal(
  groups: CommandGroup[],
  query: string,
  recent: CommandItem[] = [],
  recentLabel = 'Recent',
  locale?: string,
  { score, limit }: FilterCommandOptions = {},
): FilteredCommandGroups {
  const toEntries = (items: CommandItem[], prefix = '') => items.map((item) => ({ key: prefix + item.id, item }));
  const trimmed = query.trim();
  let visible: CommandEntryGroup[];
  if (!trimmed && !score) {
    const all = groups.map((g) => ({ value: g.label, items: toEntries(g.items) }));
    visible = [...(recent.length ? [{ value: recentLabel, items: toEntries(recent, 'recent:') }] : []), ...all];
  } else {
    // A custom scorer also ranks the empty query (recent items stay first, unscored).
    const rank = score ?? ((item: CommandItem, q: string) => scoreCommand(item, q, locale));
    const ranked = groups.map((g) => ({
      value: g.label,
      items: g.items
        .map((item) => ({ item, score: rank(item, trimmed) }))
        .filter((r) => r.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => ({ key: item.id, item })),
    }));
    const recents = !trimmed && recent.length ? [{ value: recentLabel, items: toEntries(recent, 'recent:') }] : [];
    visible = [...recents, ...ranked];
  }
  visible = visible.filter((g) => g.items.length);
  const total = visible.reduce((n, g) => n + g.items.length, 0);
  if (limit === undefined || total <= limit) return { groups: visible, total };
  let left = Math.max(0, limit);
  const cut = visible
    .map((g) => {
      const items = g.items.slice(0, left);
      left -= items.length;
      return { value: g.value, items };
    })
    .filter((g) => g.items.length);
  return { groups: cut, total };
}

/** Same as `filterCommandGroupsWithTotal`, returning only the visible groups. */
export function filterCommandGroups(
  groups: CommandGroup[],
  query: string,
  recent: CommandItem[] = [],
  recentLabel = 'Recent',
  locale?: string,
  options?: FilterCommandOptions,
): CommandEntryGroup[] {
  return filterCommandGroupsWithTotal(groups, query, recent, recentLabel, locale, options).groups;
}
