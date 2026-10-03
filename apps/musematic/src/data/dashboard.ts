import type { ActivityItem, ChartCardRange, KpiItem } from '@gntik-ai/blocks';
import { Bot, KeyRound, MessageSquare, Workflow } from '@gntik-ai/icons';
import { hoursAgo, minutesAgo, daysAgo } from './time';

export const fleetKpis: KpiItem[] = [
  { id: 'agents', label: 'Active agents', value: '38', delta: { value: '+3', direction: 'up', sentiment: 'positive' }, trend: [31, 32, 32, 34, 35, 35, 38] },
  { id: 'runs', label: 'Runs · 24h', value: '43,407', delta: { value: '+8.1%', direction: 'up', sentiment: 'positive' }, trend: [36, 38, 37, 40, 41, 42, 43] },
  { id: 'success', label: 'Success rate', value: '96.4%', delta: { value: '−0.6 pt', direction: 'down', sentiment: 'negative' }, trend: [97.2, 97.1, 96.9, 97, 96.8, 96.6, 96.4] },
  { id: 'spend', label: 'Spend · month to date', value: '$2,540', delta: { value: '+4.2%', direction: 'up', sentiment: 'neutral' }, trend: [310, 640, 980, 1320, 1710, 2120, 2540] },
];

/** Runs and failed runs per day (the template's "Requests"/"Errors" series). */
export interface RunPoint {
  day: string;
  Requests: number;
  Errors: number;
}

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Sep ${i + 4}`);
const series = (labels: string[], base: number, step: number): RunPoint[] =>
  labels.map((day, i) => ({ day, Requests: Math.round(base + step * i + ((i * 41) % 9) * 900), Errors: Math.round(900 + ((i * 17) % 6) * 140) }));

export const runsByRange: Record<string, RunPoint[]> = { '7d': series(DAYS7, 36_000, 1_100), '30d': series(DAYS30, 29_000, 420) };
export const runRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '287,950', delta: { value: '+8.1%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '1.14M', delta: { value: '+5.3%', direction: 'up', sentiment: 'positive' } } },
];

export const fleetActivity: ActivityItem[] = [
  { id: 'f1', actor: { name: 'Lucía Romero' }, action: 'promoted', target: 'support-triage v13', at: minutesAgo(12) },
  { id: 'f2', actor: { name: 'Priya Shah' }, action: 'acknowledged the failure of', target: 'security-auditor', at: minutesAgo(48) },
  { id: 'f3', actor: { name: 'Marc Duran' }, action: 'published the workflow', target: 'Invoice matching', at: hoursAgo(3) },
  { id: 'f4', actor: { name: 'Tomás Vidal' }, action: 'scaled', target: 'market-intel to 6 replicas', at: hoursAgo(5) },
  { id: 'f5', actor: { name: 'Elena Costa' }, action: 'paused', target: 'sales-qualifier', at: daysAgo(1) },
  { id: 'f6', actor: { name: 'Lucía Romero' }, action: 'added the model key', target: 'Evaluations', at: daysAgo(2) },
];

export const quickActions = [
  { id: 'new-agent', title: 'Create an agent', description: 'Start from a template or a blank prompt.', icon: Bot, href: '/agents/new' },
  { id: 'workflow', title: 'Build a workflow', description: 'Chain agents, routers and human review.', icon: Workflow, href: '/workflows/support-escalation' },
  { id: 'model-key', title: 'Add a model key', description: 'Connect a provider or a compatible gateway.', icon: KeyRound, href: '/settings/model-keys' },
  { id: 'assistant', title: 'Ask the assistant', description: 'Questions about runs, costs and agents.', icon: MessageSquare, href: '/assistant' },
];
