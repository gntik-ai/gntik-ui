import { KPI_ITEMS, PROJECT_ACTIVITY, type ActivityItem, type ChartCardRange, type KpiItem } from '@gntik-ai/blocks';
import { BookOpen, KeyRound, Rocket, UserPlus, type LucideIcon } from '@gntik-ai/icons';
import type { BreadcrumbItem } from '@gntik-ai/ui';

/** A shortcut card in the "Quick actions" grid. */
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export interface RequestPoint {
  day: string;
  Requests: number;
  Errors: number;
}

export const homeBreadcrumbs: BreadcrumbItem[] = [{ label: 'Overview' }];

export const homeKpis: KpiItem[] = KPI_ITEMS;

export const homeActivity: ActivityItem[] = PROJECT_ACTIVITY;

export const homeQuickActions: QuickAction[] = [
  { id: 'deploy', title: 'Deploy a service', description: 'Ship a new build from a branch or tag.', icon: Rocket },
  { id: 'invite', title: 'Invite members', description: 'Add teammates and pick their role.', icon: UserPlus },
  { id: 'api-key', title: 'Create an API key', description: 'Scoped keys for CI and integrations.', icon: KeyRound },
  { id: 'docs', title: 'Read the docs', description: 'Guides, API reference and examples.', icon: BookOpen, href: '#docs' },
];

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

const requestSeries = (labels: string[], base: number, step: number): RequestPoint[] =>
  labels.map((day, i) => ({
    day,
    Requests: Math.round(base + step * i + ((i * 37) % 11) * 180),
    Errors: Math.round(40 + ((i * 13) % 7) * 9),
  }));

/** Requests and errors per day, per range. */
export const homeRequestsByRange: Record<string, RequestPoint[]> = {
  '7d': requestSeries(DAYS7, 31_000, 1_200),
  '30d': requestSeries(DAYS30, 28_000, 340),
};

export const homeRequestRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '271,480', delta: { value: '+12.4%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '1.08M', delta: { value: '+6.0%', direction: 'up', sentiment: 'positive' } } },
];
