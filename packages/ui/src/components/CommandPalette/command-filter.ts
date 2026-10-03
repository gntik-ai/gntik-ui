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
  const t = text.toLowerCase();
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
export function scoreCommand(item: CommandItem, query: string): number {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  let total = 0;
  for (const token of tokens) {
    const best = Math.max(
      scoreToken(item.label, token),
      ...(item.keywords ?? []).map((k) => scoreToken(k, token) * 0.9),
      item.description ? scoreToken(item.description, token) * 0.5 : -1,
    );
    if (best < 0) return -1;
    total += best;
  }
  return total;
}

/**
 * Builds the visible groups: with an empty query, recent items first then every group as given;
 * otherwise only matching items, best first within each group, and empty groups dropped.
 */
export function filterCommandGroups(groups: CommandGroup[], query: string, recent: CommandItem[] = [], recentLabel = 'Recent'): CommandEntryGroup[] {
  const toEntries = (items: CommandItem[], prefix = '') => items.map((item) => ({ key: prefix + item.id, item }));
  if (!query.trim()) {
    const all = groups.map((g) => ({ value: g.label, items: toEntries(g.items) }));
    return [...(recent.length ? [{ value: recentLabel, items: toEntries(recent, 'recent:') }] : []), ...all].filter((g) => g.items.length);
  }
  return groups
    .map((g) => ({
      value: g.label,
      items: g.items
        .map((item) => ({ item, score: scoreCommand(item, query) }))
        .filter((r) => r.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => ({ key: item.id, item })),
    }))
    .filter((g) => g.items.length);
}
