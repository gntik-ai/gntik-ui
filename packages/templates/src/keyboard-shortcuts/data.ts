import type { BreadcrumbItem } from '@gntik-ai/ui';

export interface Shortcut {
  id: string;
  /** What the shortcut does. */
  description: string;
  /** Keys pressed together, e.g. ['⌘', 'K']. */
  keys: string[];
  /** A second combination that does the same (e.g. a sequence "G then P"). */
  then?: string[];
}

export interface ShortcutGroup {
  id: string;
  title: string;
  shortcuts: Shortcut[];
}

export const shortcutBreadcrumbs: BreadcrumbItem[] = [{ label: 'Help', href: '/help' }, { label: 'Keyboard shortcuts' }];

/** Neutral console shortcuts, grouped by area. */
export const shortcutGroups: ShortcutGroup[] = [
  {
    id: 'general',
    title: 'General',
    shortcuts: [
      { id: 'palette', description: 'Open the command palette', keys: ['⌘', 'K'] },
      { id: 'help', description: 'Show keyboard shortcuts', keys: ['?'] },
      { id: 'sidebar', description: 'Collapse or expand the sidebar', keys: ['⌘', 'B'] },
      { id: 'theme', description: 'Switch theme', keys: ['⌘', '⇧', 'L'] },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    shortcuts: [
      { id: 'go-home', description: 'Go to overview', keys: ['G'], then: ['O'] },
      { id: 'go-projects', description: 'Go to projects', keys: ['G'], then: ['P'] },
      { id: 'go-deployments', description: 'Go to deployments', keys: ['G'], then: ['D'] },
      { id: 'go-settings', description: 'Go to settings', keys: ['G'], then: ['S'] },
    ],
  },
  {
    id: 'lists',
    title: 'Lists and tables',
    shortcuts: [
      { id: 'next', description: 'Next row', keys: ['J'] },
      { id: 'prev', description: 'Previous row', keys: ['K'] },
      { id: 'open', description: 'Open the selected row', keys: ['↵'] },
      { id: 'select', description: 'Select the row', keys: ['X'] },
      { id: 'filter', description: 'Focus the filter', keys: ['/'] },
    ],
  },
  {
    id: 'editing',
    title: 'Editing',
    shortcuts: [
      { id: 'save', description: 'Save changes', keys: ['⌘', 'S'] },
      { id: 'submit', description: 'Submit a form or comment', keys: ['⌘', '↵'] },
      { id: 'cancel', description: 'Cancel and close', keys: ['Esc'] },
      { id: 'undo', description: 'Undo', keys: ['⌘', 'Z'] },
    ],
  },
];

/** Groups with only the shortcuts whose description or keys match the query. */
export function filterShortcuts(groups: readonly ShortcutGroup[], query: string): ShortcutGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...groups];
  return groups
    .map((g) => ({
      ...g,
      shortcuts: g.shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          [...s.keys, ...(s.then ?? [])].join(' ').toLowerCase() === q,
      ),
    }))
    .filter((g) => g.shortcuts.length > 0);
}
