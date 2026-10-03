import type { StatusEvent } from '@gntik-ai/blocks';
import type { BadgeProps, BreadcrumbItem, PowerSearchField } from '@gntik-ai/ui';

export type IncidentSeverity = 'sev1' | 'sev2' | 'sev3';
export type IncidentStatus = 'triggered' | 'acknowledged' | 'resolved';
export type IncidentField = 'severity' | 'status' | 'service' | 'assignee';

export interface Incident {
  id: string;
  title: string;
  summary: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  /** Epoch ms when the first alert fired. */
  startedAt: number;
  resolvedAt?: number;
  assignee: string;
  /** Newest first. */
  events: StatusEvent[];
}

export const severityLabels: Record<IncidentSeverity, string> = { sev1: 'SEV1', sev2: 'SEV2', sev3: 'SEV3' };
export const severityTones: Record<IncidentSeverity, NonNullable<BadgeProps['tone']>> = { sev1: 'destructive', sev2: 'warning', sev3: 'info' };
export const statusLabels: Record<IncidentStatus, string> = { triggered: 'Triggered', acknowledged: 'Acknowledged', resolved: 'Resolved' };

export const incidentFields: PowerSearchField<IncidentField>[] = [
  { key: 'severity', label: 'severity', type: 'enum', values: [{ value: 'sev1', label: 'SEV1' }, { value: 'sev2', label: 'SEV2' }, { value: 'sev3', label: 'SEV3' }], description: 'Impact level' },
  { key: 'status', label: 'status', type: 'enum', values: ['triggered', 'acknowledged', 'resolved'] },
  { key: 'service', label: 'service', values: ['api-gateway', 'billing-worker', 'search-index', 'auth-service', 'webhooks'] },
  { key: 'assignee', label: 'assignee', values: ['ada', 'grace', 'linus', 'unassigned'] },
];

/** Default view: everything that is not resolved. */
export const defaultIncidentQuery = 'status!=resolved';

export const incidentBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Incidents' }];

const MIN = 60_000;
const NOW = Date.now();

export const incidents: Incident[] = [
  {
    id: 'INC-2041',
    title: 'Elevated 5xx on api-gateway',
    summary: 'Error rate above 4% in eu-west-1 for 6 minutes. Upstream timeouts to auth-service.',
    service: 'api-gateway',
    severity: 'sev1',
    status: 'triggered',
    startedAt: NOW - 14 * MIN,
    assignee: 'unassigned',
    events: [
      { id: 'e3', status: 'triggered', tone: 'destructive', title: 'Paged on-call', description: 'Escalation policy “Platform” level 1', at: NOW - 12 * MIN },
      { id: 'e2', status: 'triggered', tone: 'destructive', title: 'Alert: 5xx rate > 4%', at: NOW - 14 * MIN, actor: 'monitor' },
    ],
  },
  {
    id: 'INC-2040',
    title: 'Billing worker queue backlog',
    summary: 'Invoice jobs waiting more than 10 minutes. Throughput is half of normal.',
    service: 'billing-worker',
    severity: 'sev2',
    status: 'acknowledged',
    startedAt: NOW - 52 * MIN,
    assignee: 'grace',
    events: [
      { id: 'e2', status: 'acknowledged', tone: 'warning', title: 'Acknowledged', description: 'Scaling workers to 12', at: NOW - 41 * MIN, actor: 'grace' },
      { id: 'e1', status: 'triggered', tone: 'destructive', title: 'Alert: queue age > 10 min', at: NOW - 52 * MIN, actor: 'monitor' },
    ],
  },
  {
    id: 'INC-2039',
    title: 'Search index lagging',
    summary: 'Indexing delay of 4 minutes; results may be stale.',
    service: 'search-index',
    severity: 'sev3',
    status: 'triggered',
    startedAt: NOW - 8 * MIN,
    assignee: 'linus',
    events: [{ id: 'e1', status: 'triggered', tone: 'destructive', title: 'Alert: index lag > 3 min', at: NOW - 8 * MIN, actor: 'monitor' }],
  },
  {
    id: 'INC-2038',
    title: 'Webhook deliveries failing for one region',
    summary: 'Retries exhausted for 2% of deliveries to ap-south endpoints.',
    service: 'webhooks',
    severity: 'sev2',
    status: 'resolved',
    startedAt: NOW - 6 * 60 * MIN,
    resolvedAt: NOW - 5 * 60 * MIN,
    assignee: 'ada',
    events: [
      { id: 'e3', status: 'resolved', tone: 'success', title: 'Resolved', description: 'DNS record restored', at: NOW - 5 * 60 * MIN, actor: 'ada' },
      { id: 'e2', status: 'acknowledged', tone: 'warning', title: 'Acknowledged', at: NOW - 344 * MIN, actor: 'ada' },
      { id: 'e1', status: 'triggered', tone: 'destructive', title: 'Alert: delivery failures > 1%', at: NOW - 6 * 60 * MIN, actor: 'monitor' },
    ],
  },
];
