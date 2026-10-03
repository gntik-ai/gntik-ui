import type { ChartCardRange, KpiItem } from '@gntik-ai/blocks';
import { FolderKanban, Settings, UserPlus } from '@gntik-ai/icons';
import type { HomeDashboardPage } from '@gntik-ai/templates';
import type { ComponentProps } from 'react';

type DashboardProps = ComponentProps<typeof HomeDashboardPage>;

export const kpis: KpiItem[] = [
  { id: 'projects', label: 'Active projects', value: '12', delta: { value: '+2', direction: 'up', sentiment: 'positive', note: 'vs. 30 days ago' }, trend: [8, 9, 9, 10, 10, 11, 12] },
  { id: 'requests', label: 'Requests · 24h', value: '214,380', delta: { value: '+7.9%', direction: 'up', sentiment: 'positive', note: 'vs. previous 24h' }, trend: [180, 192, 188, 201, 196, 209, 214] },
  { id: 'errors', label: 'Error rate', value: '0.41%', delta: { value: '−0.12 pt', direction: 'down', sentiment: 'positive', note: 'vs. previous 24h' }, trend: [0.6, 0.58, 0.55, 0.5, 0.47, 0.44, 0.41] },
  { id: 'spend', label: 'Spend · month to date', value: '$4,812', delta: { value: '+3.1%', direction: 'up', sentiment: 'negative', note: 'vs. last month' }, trend: [3.1, 3.4, 3.7, 4.0, 4.3, 4.6, 4.8], trendTone: 'warning' },
];

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const series = (labels: string[], base: number, step: number) =>
  labels.map((day, i) => ({ day, Requests: base + step * i + ((i * 29) % 13) * 140, Errors: 60 + ((i * 11) % 9) * 7 }));

export const requestsByRange: NonNullable<DashboardProps['requestsByRange']> = {
  '7d': series(DAYS7, 26_000, 900),
  '30d': series(DAYS30, 24_000, 260),
};

export const requestRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '214,380', delta: { value: '+7.9%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '0.86M', delta: { value: '+4.2%', direction: 'up', sentiment: 'positive' } } },
];

export const quickActions: NonNullable<DashboardProps['quickActions']> = [
  { id: 'projects', title: 'Browse projects', description: 'Status, traffic and cost per project.', icon: FolderKanban, href: '/projects' },
  { id: 'invite', title: 'Invite members', description: 'Add teammates and pick their role.', icon: UserPlus, href: '/settings/members' },
  { id: 'profile', title: 'Edit your profile', description: 'Name, locale and time zone.', icon: Settings, href: '/settings/profile' },
];
