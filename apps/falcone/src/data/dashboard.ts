import type { ActivityItem, ChartCardRange, KpiItem } from '@gntik-ai/blocks';
import { Boxes, KeyRound, Plug, Workflow } from '@gntik-ai/icons';
import type { QuickAction } from '@gntik-ai/templates';
import { daysAgo, hoursAgo, minutesAgo } from './time';

export const homeKpis: KpiItem[] = [
  { id: 'invocations', label: 'Invocations · 24h', value: '7.04M', delta: { value: '+6.4%', direction: 'up', sentiment: 'positive' }, trend: [5.9, 6.1, 6.3, 6.2, 6.6, 6.8, 7.04] },
  { id: 'errors', label: 'Error rate', value: '0.21%', delta: { value: '+0.04 pt', direction: 'up', sentiment: 'negative' }, trend: [0.16, 0.17, 0.15, 0.18, 0.19, 0.2, 0.21] },
  { id: 'p95', label: 'p95 latency', value: '148 ms', delta: { value: '−12 ms', direction: 'down', sentiment: 'positive' }, trend: [171, 166, 162, 158, 155, 151, 148] },
  { id: 'cost', label: 'Metered cost · month to date', value: '$8,027', delta: { value: '+3.1%', direction: 'up', sentiment: 'neutral' }, trend: [1100, 2250, 3410, 4600, 5790, 6900, 8027] },
];

/** Metered spend per day, by meter (the first chart). */
export interface SpendPoint {
  day: string;
  Compute: number;
  'LLM tokens': number;
  Egress: number;
}

/** Invocations and errors per day (the second chart). */
export interface InvocationPoint {
  day: string;
  Invocations: number;
  Errors: number;
}

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Sep ${i + 4}`);

const spend = (labels: string[]): SpendPoint[] =>
  labels.map((day, i) => ({ day, Compute: 140 + ((i * 37) % 9) * 6, 'LLM tokens': 95 + ((i * 13) % 7) * 11, Egress: 22 + ((i * 7) % 5) * 3 }));
const invocations = (labels: string[], base: number): InvocationPoint[] =>
  labels.map((day, i) => ({ day, Invocations: Math.round(base + ((i * 41) % 9) * 120_000), Errors: Math.round(9_000 + ((i * 17) % 6) * 1_400) }));

export const spendByRange: Record<string, SpendPoint[]> = { '7d': spend(DAYS7), '30d': spend(DAYS30) };
export const spendRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '$1,912', delta: { value: '+3.1%', direction: 'up', sentiment: 'neutral' } } },
  { value: '30d', label: '30d', summary: { value: '$8,027', delta: { value: '+5.8%', direction: 'up', sentiment: 'neutral' } } },
];

export const invocationsByRange: Record<string, InvocationPoint[]> = { '7d': invocations(DAYS7, 6_400_000), '30d': invocations(DAYS30, 5_900_000) };
export const invocationRanges: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '47.3M', delta: { value: '+6.4%', direction: 'up', sentiment: 'positive' } } },
  { value: '30d', label: '30d', summary: { value: '193M', delta: { value: '+4.9%', direction: 'up', sentiment: 'positive' } } },
];

export const homeActivity: ActivityItem[] = [
  { id: 'h1', actor: { name: 'Ingrid Halvorsen' }, action: 'deployed', target: 'checkout-api to prod', at: minutesAgo(18) },
  { id: 'h2', actor: { name: 'Omar Haddad' }, action: 'acknowledged the SLO breach on', target: 'support-copilot', at: hoursAgo(2) },
  { id: 'h3', actor: { name: 'Mei Tanaka' }, action: 'published the workflow', target: 'Order fulfilment', at: hoursAgo(4) },
  { id: 'h4', actor: { name: 'Lukas Brandt' }, action: 'rotated the provider key', target: 'Gateway', at: hoursAgo(11) },
  { id: 'h5', actor: { name: 'Ingrid Halvorsen' }, action: 'raised the invocation quota of', target: 'ingest-pipeline', at: daysAgo(2) },
];

export const quickActions: QuickAction[] = [
  { id: 'project', title: 'Create a project', description: 'Stages, functions and an MCP server in one place.', icon: Boxes, href: '/projects' },
  { id: 'workflow', title: 'Build a workflow', description: 'Chain functions, branches and real-time events.', icon: Workflow, href: '/workflows/order-fulfilment' },
  { id: 'provider', title: 'Bring your own model key', description: 'Connect an LLM provider for this tenant.', icon: KeyRound, href: '/settings/model-providers' },
  { id: 'integrations', title: 'Connect an integration', description: 'Webhooks, source control and alerting.', icon: Plug, href: '/settings/integrations' },
];
