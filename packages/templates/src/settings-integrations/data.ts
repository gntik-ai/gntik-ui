import { BellRing, Database, GitBranch, HardDrive, ListTodo, MessageSquare, type LucideIcon } from '@gntik-ai/icons';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export interface Connector {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused' | 'failing';
  /** ISO date of the last delivery attempt. */
  lastDeliveryAt: string | null;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  /** HTTP status code returned by the endpoint; null on timeout. */
  statusCode: number | null;
  durationMs: number;
  /** ISO date. */
  at: string;
}

export const connectors: Connector[] = [
  { id: 'chat', name: 'Team chat', description: 'Post deployment and incident updates to a channel.', icon: MessageSquare, enabled: true },
  { id: 'source', name: 'Source control', description: 'Build previews for every pull request.', icon: GitBranch, enabled: true },
  { id: 'issues', name: 'Issue tracker', description: 'Link deployments to the issues they close.', icon: ListTodo, enabled: false },
  { id: 'paging', name: 'Incident paging', description: 'Page the on-call member when a deployment fails.', icon: BellRing, enabled: false },
  { id: 'warehouse', name: 'Data warehouse', description: 'Export usage and audit events every night.', icon: Database, enabled: true },
  { id: 'storage', name: 'Object storage', description: 'Archive build logs and artifacts to your bucket.', icon: HardDrive, enabled: false },
];

export const webhookEndpoints: WebhookEndpoint[] = [
  { id: 'wh1', url: 'https://hooks.example.com/deployments', events: ['deployment.succeeded', 'deployment.failed'], status: 'active', lastDeliveryAt: minutesAgo(3) },
  { id: 'wh2', url: 'https://ops.example.net/alerts', events: ['incident.opened'], status: 'failing', lastDeliveryAt: minutesAgo(18) },
  { id: 'wh3', url: 'https://billing.example.org/usage', events: ['usage.threshold'], status: 'paused', lastDeliveryAt: minutesAgo(60 * 24 * 6) },
];

export const webhookDeliveries: WebhookDelivery[] = [
  { id: 'd1', endpointId: 'wh1', event: 'deployment.succeeded', statusCode: 200, durationMs: 142, at: minutesAgo(3) },
  { id: 'd2', endpointId: 'wh2', event: 'incident.opened', statusCode: 503, durationMs: 2010, at: minutesAgo(18) },
  { id: 'd3', endpointId: 'wh1', event: 'deployment.failed', statusCode: 200, durationMs: 188, at: minutesAgo(46) },
  { id: 'd4', endpointId: 'wh2', event: 'incident.opened', statusCode: null, durationMs: 10000, at: minutesAgo(52) },
  { id: 'd5', endpointId: 'wh1', event: 'deployment.succeeded', statusCode: 204, durationMs: 97, at: minutesAgo(130) },
  { id: 'd6', endpointId: 'wh3', event: 'usage.threshold', statusCode: 200, durationMs: 311, at: minutesAgo(60 * 24 * 6) },
];
