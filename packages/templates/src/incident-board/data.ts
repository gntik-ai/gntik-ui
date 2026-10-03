import type { ActiveFilter, FilterField, KpiItem } from '@gntik-ai/blocks';
import { moveKanbanCard, type BreadcrumbItem, type KanbanCard, type KanbanColumn, type KanbanMove, type StatusDefinition } from '@gntik-ai/ui';

export type TriageSeverity = 'sev1' | 'sev2' | 'sev3';
export type TriageStage = 'triage' | 'investigating' | 'mitigated' | 'resolved';

/** One incident card on the triage board. */
export interface TriageIncident extends KanbanCard {
  severity: TriageSeverity;
  service: string;
  owner: string;
  /** Epoch ms when the incident was declared. */
  openedAt: number;
  summary: string;
}

export const triageSeverities: Record<TriageSeverity, StatusDefinition> = {
  sev1: { label: 'SEV1', tone: 'destructive' },
  sev2: { label: 'SEV2', tone: 'warning' },
  sev3: { label: 'SEV3', tone: 'info' },
};

export const triageStageLabels: Record<TriageStage, string> = {
  triage: 'Triage',
  investigating: 'Investigating',
  mitigated: 'Mitigated',
  resolved: 'Resolved',
};

export const UNASSIGNED = 'Unassigned';

/** Compact age ("45m", "3h 10m", "2d 4h") of an incident opened at `openedAt`. */
export function formatAge(openedAt: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - openedAt) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`;
}

const MIN = 60_000;
/** Fixture clock: ages are computed against this instant. */
export const triageNow = Date.now();
const ago = (minutes: number) => triageNow - minutes * MIN;

const incident = (
  id: string,
  title: string,
  severity: TriageSeverity,
  service: string,
  owner: string,
  minutesAgo: number,
  summary: string,
): TriageIncident => ({ id, title, severity, service, owner, openedAt: ago(minutesAgo), summary });

export const triageColumns: KanbanColumn<TriageIncident>[] = [
  {
    id: 'triage',
    title: triageStageLabels.triage,
    cards: [
      incident('INC-3120', 'Checkout latency above 2 s', 'sev1', 'payments-api', UNASSIGNED, 12, 'p95 latency on checkout doubled after the 14:00 deploy; error budget burning at 6×.'),
      incident('INC-3118', 'Search results missing new items', 'sev3', 'search-index', UNASSIGNED, 95, 'Items created in the last hour do not appear in search; indexing lag is growing.'),
    ],
  },
  {
    id: 'investigating',
    title: triageStageLabels.investigating,
    cards: [
      incident('INC-3115', 'Elevated 5xx on the API gateway', 'sev1', 'api-gateway', 'Ada Park', 48, 'One availability zone returns 502s for 4% of requests; traffic shift in progress.'),
      incident('INC-3111', 'Webhook deliveries delayed', 'sev2', 'webhooks', 'Linus Ortega', 190, 'Delivery queue depth at 40k; workers restart on an out-of-memory error.'),
    ],
  },
  {
    id: 'mitigated',
    title: triageStageLabels.mitigated,
    cards: [incident('INC-3104', 'Sign-in emails bouncing', 'sev2', 'auth-service', 'Grace Kim', 420, 'Mail provider rate limit hit; traffic moved to the backup sender.')],
  },
  {
    id: 'resolved',
    title: triageStageLabels.resolved,
    cards: [
      incident('INC-3097', 'Dashboard charts not loading', 'sev3', 'analytics', 'Mei Chen', 1500, 'A stale CDN asset broke the chart bundle; cache purged and a fix deployed.'),
      incident('INC-3092', 'Billing worker stuck on retries', 'sev2', 'billing-worker', 'Ada Park', 2900, 'A malformed invoice blocked the queue; it was skipped and the parser fixed.'),
    ],
  },
];

const services = [...new Set(triageColumns.flatMap((c) => c.cards.map((i) => i.service)))].sort();
const owners = [...new Set(triageColumns.flatMap((c) => c.cards.map((i) => i.owner)))].sort();

export const triageFilterFields: FilterField[] = [
  { id: 'severity', label: 'Severity', options: Object.values(triageSeverities).map((s) => s.label) },
  { id: 'service', label: 'Service', options: services },
  { id: 'owner', label: 'Owner', options: owners },
];

/** Filter value of an incident for a FilterBar field id. */
export function triageFieldValue(i: TriageIncident, field: string): string | undefined {
  if (field === 'severity') return triageSeverities[i.severity].label;
  if (field === 'service') return i.service;
  if (field === 'owner') return i.owner;
  return undefined;
}

/** True when the incident matches the search text and every filtered field (OR within a field). */
export function matchesTriage(i: TriageIncident, query: string, filters: readonly ActiveFilter[]): boolean {
  const q = query.trim().toLowerCase();
  if (q && ![i.id, i.title, i.service, i.owner].some((v) => v.toLowerCase().includes(q))) return false;
  const byField = new Map<string, string[]>();
  for (const f of filters) byField.set(f.field, [...(byField.get(f.field) ?? []), f.value]);
  return [...byField].every(([field, values]) => values.includes(triageFieldValue(i, field) ?? ''));
}

/** KPI tiles computed from the board. */
export function triageKpis(columns: KanbanColumn<TriageIncident>[]): KpiItem[] {
  const cards = (id: string) => columns.find((c) => c.id === id)?.cards ?? [];
  const open = columns.filter((c) => c.id !== 'resolved').flatMap((c) => c.cards);
  return [
    { id: 'open', label: 'Open incidents', value: String(open.length) },
    { id: 'sev1', label: 'Open SEV1', value: String(open.filter((i) => i.severity === 'sev1').length) },
    { id: 'unassigned', label: 'Unassigned', value: String(open.filter((i) => i.owner === UNASSIGNED).length) },
    { id: 'resolved', label: 'Resolved', value: String(cards('resolved').length) },
  ];
}

export const triageBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Incidents' }];

/**
 * Maps a move made on the filtered (visible) board onto the full board: the card lands before the
 * visible card it was dropped on, or after the last visible one. Returns the new columns and the
 * move in full-board indices.
 */
export function applyVisibleMove<T extends KanbanCard>(
  full: KanbanColumn<T>[],
  visible: KanbanColumn<T>[],
  move: KanbanMove,
): { columns: KanbanColumn<T>[]; move: KanbanMove } {
  const cardsOf = (cols: KanbanColumn<T>[], id: string) => cols.find((c) => c.id === id)?.cards ?? [];
  const fromIndex = cardsOf(full, move.fromColumnId).findIndex((c) => c.id === move.cardId);
  const destVisible = cardsOf(visible, move.toColumnId).filter((c) => c.id !== move.cardId);
  const destFull = cardsOf(full, move.toColumnId).filter((c) => c.id !== move.cardId);
  const anchor = destVisible[move.toIndex];
  const last = destVisible[destVisible.length - 1];
  const toIndex = anchor ? destFull.findIndex((c) => c.id === anchor.id) : last ? destFull.findIndex((c) => c.id === last.id) + 1 : destFull.length;
  const fullMove = { ...move, fromIndex, toIndex };
  return { columns: moveKanbanCard(full, fullMove), move: fullMove };
}
