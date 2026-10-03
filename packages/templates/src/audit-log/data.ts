import type { FilterField } from '@gntik-ai/blocks';
import type { BreadcrumbItem, StatusDefinition } from '@gntik-ai/ui';

export type AuditResult = 'succeeded' | 'failed' | 'denied';

export interface AuditEvent {
  id: string;
  at: Date;
  actor: { name: string; email: string };
  /** Dotted action key, e.g. "project.update". */
  action: string;
  /** Kind of resource touched (filter field). */
  resource: string;
  /** The resource instance, e.g. "web-app". */
  target: string;
  ip: string;
  result: AuditResult;
  /** Unified diff of the change; absent for events without a payload change. */
  diff?: string;
}

export const auditResultStatuses: Record<string, StatusDefinition> = {
  denied: { label: 'Denied', tone: 'warning' },
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const NOW = Date.now();

const dana = { name: 'Dana Whitfield', email: 'dana@example.com' };
const sam = { name: 'Sam Patel', email: 'sam@example.com' };
const lee = { name: 'Lee Chen', email: 'lee@example.com' };
const bot = { name: 'Deploy bot', email: 'bot@example.com' };

/** Neutral audit trail, newest first, all within the last 6 days. */
export const auditEvents: AuditEvent[] = [
  {
    id: 'evt_9f21',
    at: new Date(NOW - 6 * MIN),
    actor: dana,
    action: 'project.update',
    resource: 'Project',
    target: 'web-app',
    ip: '203.0.113.24',
    result: 'succeeded',
    diff: ' {\n   "name": "web-app",\n-  "region": "eu-west-1",\n+  "region": "eu-central-1",\n-  "autoscale": false\n+  "autoscale": true\n }',
  },
  {
    id: 'evt_9f1c',
    at: new Date(NOW - 48 * MIN),
    actor: sam,
    action: 'member.role.update',
    resource: 'Member',
    target: 'lee@example.com',
    ip: '198.51.100.7',
    result: 'succeeded',
    diff: ' {\n   "member": "lee@example.com",\n-  "role": "viewer"\n+  "role": "developer"\n }',
  },
  {
    id: 'evt_9f0a',
    at: new Date(NOW - 3 * HOUR),
    actor: lee,
    action: 'billing.plan.update',
    resource: 'Billing',
    target: 'Acme Industries',
    ip: '192.0.2.81',
    result: 'denied',
  },
  {
    id: 'evt_9ef3',
    at: new Date(NOW - 7 * HOUR),
    actor: bot,
    action: 'deployment.create',
    resource: 'Deployment',
    target: 'orders-api build 212',
    ip: '10.0.4.12',
    result: 'failed',
  },
  {
    id: 'evt_9ee8',
    at: new Date(NOW - 26 * HOUR),
    actor: dana,
    action: 'api_key.create',
    resource: 'API key',
    target: 'ci-pipeline',
    ip: '203.0.113.24',
    result: 'succeeded',
    diff: '+{\n+  "name": "ci-pipeline",\n+  "scopes": ["deployments:write"],\n+  "expiresIn": "90d"\n+}',
  },
  {
    id: 'evt_9ed1',
    at: new Date(NOW - 2 * 24 * HOUR),
    actor: sam,
    action: 'member.invite',
    resource: 'Member',
    target: 'riley@example.com',
    ip: '198.51.100.7',
    result: 'succeeded',
  },
  {
    id: 'evt_9ec0',
    at: new Date(NOW - 3 * 24 * HOUR),
    actor: dana,
    action: 'project.delete',
    resource: 'Project',
    target: 'legacy-site',
    ip: '203.0.113.24',
    result: 'succeeded',
    diff: '-{\n-  "name": "legacy-site",\n-  "region": "us-east-1"\n-}',
  },
  {
    id: 'evt_9eb4',
    at: new Date(NOW - 5 * 24 * HOUR),
    actor: lee,
    action: 'api_key.revoke',
    resource: 'API key',
    target: 'old-ci',
    ip: '192.0.2.81',
    result: 'succeeded',
  },
];

export const auditFilterFields: FilterField[] = [
  { id: 'actor', label: 'Actor', options: [dana.name, sam.name, lee.name, bot.name] },
  { id: 'resource', label: 'Resource', options: ['Project', 'Member', 'Deployment', 'API key', 'Billing'] },
  { id: 'result', label: 'Result', options: ['succeeded', 'failed', 'denied'] },
];

export const auditBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Acme Industries', href: '/overview' },
  { label: 'Settings', href: '/settings' },
  { label: 'Audit log' },
];
