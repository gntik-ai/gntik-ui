import type { BadgeProps, BreadcrumbItem } from '@gntik-ai/ui';

export interface BoardColumn {
  id: string;
  title: string;
}

export interface BoardCard {
  id: string;
  title: string;
  description: string;
  assignee: string;
  labels: string[];
  priority: 'low' | 'medium' | 'high';
  /** ISO date. */
  due?: string;
}

/** Card ids per column id, in display order. */
export type BoardState = Record<string, string[]>;

export const priorityTones: Record<BoardCard['priority'], NonNullable<BadgeProps['tone']>> = { low: 'neutral', medium: 'info', high: 'warning' };
export const priorityLabels: Record<BoardCard['priority'], string> = { low: 'Low', medium: 'Medium', high: 'High' };

export const boardBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Projects', href: '/projects' }, { label: 'Board' }];

export const boardColumns: BoardColumn[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In progress' },
  { id: 'review', title: 'In review' },
  { id: 'done', title: 'Done' },
];

export const boardCards: BoardCard[] = [
  { id: 'T-101', title: 'Rotate staging database credentials', description: 'Move the staging credentials to the secrets store and rotate them.', assignee: 'Ada Example', labels: ['security'], priority: 'high', due: '2026-10-08' },
  { id: 'T-102', title: 'Add retry budget to webhooks', description: 'Cap retries per endpoint per hour so one bad endpoint cannot flood the queue.', assignee: 'Linus Park', labels: ['backend'], priority: 'medium' },
  { id: 'T-103', title: 'Empty state for the invoices table', description: 'Explain why the table is empty on new workspaces and link to billing settings.', assignee: 'Grace Hall', labels: ['frontend', 'design'], priority: 'low' },
  { id: 'T-104', title: 'Migrate usage exports to the new queue', description: 'Large exports should run as background jobs and notify when ready.', assignee: 'Ada Example', labels: ['backend'], priority: 'high', due: '2026-10-15' },
  { id: 'T-105', title: 'Keyboard shortcuts for the deployments table', description: 'J / K to move, Enter to open, X to select.', assignee: 'Grace Hall', labels: ['frontend', 'a11y'], priority: 'medium' },
  { id: 'T-106', title: 'Document the audit log export format', description: 'Fields, types and an example line for the JSON export.', assignee: 'Linus Park', labels: ['docs'], priority: 'low' },
  { id: 'T-107', title: 'Region picker on project creation', description: 'Default to the workspace region, warn about data residency.', assignee: 'Ada Example', labels: ['frontend'], priority: 'medium' },
];

export const boardState: BoardState = {
  backlog: ['T-101', 'T-102', 'T-103'],
  'in-progress': ['T-104', 'T-105'],
  review: ['T-106'],
  done: ['T-107'],
};

/** Moves a card to `toColumn` at `toIndex` (clamped); returns a new state. */
export function moveCard(state: BoardState, cardId: string, toColumn: string, toIndex: number): BoardState {
  const next: BoardState = {};
  for (const [col, ids] of Object.entries(state)) next[col] = ids.filter((id) => id !== cardId);
  const target = next[toColumn] ?? [];
  const index = Math.max(0, Math.min(toIndex, target.length));
  next[toColumn] = [...target.slice(0, index), cardId, ...target.slice(index)];
  return next;
}

/** Column id and index of a card. */
export function locate(state: BoardState, cardId: string): { column: string; index: number } | null {
  for (const [column, ids] of Object.entries(state)) {
    const index = ids.indexOf(cardId);
    if (index >= 0) return { column, index };
  }
  return null;
}
