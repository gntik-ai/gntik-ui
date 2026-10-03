import {
  DEPLOYMENT_COLUMNS,
  type ActivityItem,
  type ChartCardRange,
  type DangerZoneAction,
  type DataTableColumn,
  type DeploymentRow,
  type DescriptionItem,
  type KpiItem,
  type PageHeaderMetaItem,
  type StatusEvent,
} from '@gntik-ai/blocks';
import { Clock, CreditCard, FolderPlus, Globe, Inbox, User, UserPlus } from '@gntik-ai/icons';
import type { HomeDashboardPage } from '@gntik-ai/templates';
import type { ItemOf, PropOf } from './types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const NOW = Date.now();

/** A project row: the resource-index table shape (id, name, region, status, requests, cost). */
export type Project = DeploymentRow & { description: string; owner: string };

export const projects: Project[] = [
  { id: 'web-app', name: 'web-app', description: 'Customer-facing web application.', owner: 'Alex Rivera', region: 'eu-west-1', status: 'running', requests: 84_210, cost: 412.5, updatedAt: new Date(NOW - 12 * MIN) },
  { id: 'public-api', name: 'public-api', description: 'REST API for partners and the mobile apps.', owner: 'Jamie Chen', region: 'us-east-1', status: 'running', requests: 61_904, cost: 380.1, updatedAt: new Date(NOW - 2 * HOUR) },
  { id: 'billing-service', name: 'billing-service', description: 'Invoices, payment methods and usage metering.', owner: 'Jamie Chen', region: 'eu-central-1', status: 'degraded', requests: 18_377, cost: 122.9, updatedAt: new Date(NOW - 5 * HOUR) },
  { id: 'search-index', name: 'search-index', description: 'Full-text index behind global search.', owner: 'Sam Okafor', region: 'eu-west-1', status: 'running', requests: 40_118, cost: 210.0, updatedAt: new Date(NOW - DAY) },
  { id: 'notifications', name: 'notifications', description: 'Email, push and in-app notification fan-out.', owner: 'Sam Okafor', region: 'us-east-1', status: 'queued', requests: 9_842, cost: 54.3, updatedAt: new Date(NOW - DAY - 3 * HOUR) },
  { id: 'data-export', name: 'data-export', description: 'Nightly exports to the analytics warehouse.', owner: 'Alex Rivera', region: 'ap-south-1', status: 'paused', requests: 1_204, cost: 18.75, updatedAt: new Date(NOW - 3 * DAY) },
  { id: 'auth-gateway', name: 'auth-gateway', description: 'Sign-in, SSO and session management.', owner: 'Priya Shah', region: 'eu-central-1', status: 'running', requests: 72_655, cost: 298.4, updatedAt: new Date(NOW - 4 * DAY) },
  { id: 'media-worker', name: 'media-worker', description: 'Image and video processing queue.', owner: 'Priya Shah', region: 'ap-south-1', status: 'failed', requests: 3_310, cost: 41.2, updatedAt: new Date(NOW - 6 * DAY) },
];

export const findProject = (id: string) => projects.find((p) => p.id === id);

/** The kit's deployment columns, headed "Project". */
export const projectColumns: DataTableColumn<DeploymentRow>[] = DEPLOYMENT_COLUMNS.map((c) => (c.id === 'name' ? { ...c, header: 'Project' } : c));

// ---- Home dashboard ----

export const homeKpis: KpiItem[] = [
  { id: 'projects', label: 'Active projects', value: '8', delta: { value: '+2', direction: 'up', sentiment: 'positive', note: 'vs. 30 days ago' }, trend: [5, 5, 6, 6, 7, 7, 8] },
  { id: 'requests', label: 'Requests · 24h', value: '291,620', delta: { value: '+9.8%', direction: 'up', sentiment: 'positive', note: 'vs. previous 24h' }, trend: [240, 252, 249, 266, 270, 284, 291] },
  { id: 'errors', label: 'Error rate', value: '0.42%', delta: { value: '−0.1 pt', direction: 'down', sentiment: 'positive', note: 'vs. previous 24h' }, trend: [0.6, 0.55, 0.58, 0.5, 0.47, 0.44, 0.42] },
  { id: 'spend', label: 'Spend · month to date', value: '$1,538', delta: { value: '+3.1%', direction: 'up', sentiment: 'negative', note: 'vs. last month' }, trend: [0.9, 1.0, 1.1, 1.2, 1.3, 1.45, 1.54], trendTone: 'warning' },
];

type RequestPoint = PropOf<typeof HomeDashboardPage, 'requestsByRange'>[string] extends ReadonlyArray<infer T> ? T : never;

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const series = (labels: string[], base: number, step: number): RequestPoint[] =>
  labels.map((day, i) => ({ day, Requests: Math.round(base + step * i + ((i * 29) % 9) * 900), Errors: Math.round(90 + ((i * 11) % 6) * 14) }));

export const requestsByRange: Record<string, RequestPoint[]> = { '7d': series(DAYS7, 38_000, 1_400), '30d': series(DAYS30, 33_000, 260) };

export const requestRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '291,620', delta: { value: '+9.8%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '1.16M', delta: { value: '+4.6%', direction: 'up', sentiment: 'positive' } } },
];

export const activity: ActivityItem[] = [
  { id: 'a1', actor: { name: 'Jamie Chen' }, action: 'deployed', target: 'public-api v1.8.0', at: NOW - 14 * MIN },
  { id: 'a2', actor: { name: 'Alex Rivera' }, action: 'created the project', target: 'web-app', at: NOW - 50 * MIN },
  { id: 'a3', actor: { name: 'Priya Shah' }, action: 'invited', target: 'morgan@acme.example', at: NOW - 3 * HOUR },
  { id: 'a4', actor: { name: 'Sam Okafor' }, action: 'paused', target: 'data-export', at: NOW - DAY - 2 * HOUR },
  { id: 'a5', actor: { name: 'Alex Rivera' }, action: 'upgraded the plan to', target: 'Team', at: NOW - 2 * DAY },
];

export const quickActions: ItemOf<typeof HomeDashboardPage, 'quickActions'>[] = [
  { id: 'new-project', title: 'Create a project', description: 'Start from a repository, a template or nothing.', icon: FolderPlus, href: '/projects/new' },
  { id: 'invite', title: 'Invite members', description: 'Add teammates and pick their role.', icon: UserPlus, href: '/settings/members' },
  { id: 'inbox', title: 'Check your inbox', description: 'Mentions, alerts and access requests.', icon: Inbox, href: '/inbox' },
  { id: 'billing', title: 'Review billing', description: 'Plan, usage this cycle and invoices.', icon: CreditCard, href: '/settings/billing' },
];

// ---- Project detail (derived from the row; a product fetches it) ----

export const projectMeta = (p: Project): PageHeaderMetaItem[] => [
  { label: 'Region', value: p.region, icon: Globe, mono: true },
  { label: 'Owner', value: p.owner, icon: User },
  { label: 'Updated', value: p.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: Clock },
];

export const projectDetails = (p: Project): DescriptionItem[] => [
  { id: 'status', label: 'Status', status: p.status },
  { id: 'id', label: 'Project ID', value: `prj_${p.id}`, mono: true, copyable: true },
  { id: 'region', label: 'Region', value: p.region, mono: true },
  { id: 'url', label: 'URL', value: `https://${p.id}.acme.example`, mono: true, copyable: true },
  { id: 'owner', label: 'Owner', value: p.owner },
  { id: 'requests', label: 'Requests · 24h', value: p.requests.toLocaleString('en-US') },
];

export const projectEvents = (p: Project): StatusEvent[] => [
  { id: 'e3', status: 'Running', tone: 'success', title: 'Healthy', description: 'All checks passing.', at: p.updatedAt, actor: 'System', live: p.status === 'running' },
  { id: 'e2', status: 'Deploying', tone: 'info', title: 'New version rolled out', at: p.updatedAt.getTime() - HOUR, actor: p.owner },
  { id: 'e1', status: 'Created', tone: 'neutral', title: 'Project created', at: p.updatedAt.getTime() - 9 * DAY, actor: p.owner },
];

export const projectActivity = (p: Project): ActivityItem[] => activity.map((a) => ({ ...a, target: a.id === 'a1' ? `${p.name} v1.8.0` : a.target }));

export const projectDangerActions = (p: Project): DangerZoneAction[] => [
  { id: 'pause', title: 'Pause project', description: 'Stops serving traffic until you resume it. Configuration is kept.', actionLabel: 'Pause', destructive: false },
  { id: 'delete', title: 'Delete project', description: `Permanently deletes ${p.name} and its history. This cannot be undone.`, actionLabel: 'Delete project', confirmText: p.name },
];
