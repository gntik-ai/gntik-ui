import type {
  ApiKeyScope,
  BillingPlan,
  Invitation,
  Invoice,
  Member,
  NotificationEvent,
  NotificationMatrixValue,
  PaymentMethod,
  Profile,
  Quota,
} from '@gntik-ai/blocks';
import { BellRing, Building2, Database, GitBranch, Mail, MapPin, MessageSquare, Ticket, Users } from '@gntik-ai/icons';
import {
  SettingsApiKeysPage,
  SettingsIntegrationsPage,
  SettingsMembersPage,
  SettingsProfilePage,
  SettingsWorkspacePage,
} from '@gntik-ai/templates';
import type { ComponentProps } from 'react';
import { isoDaysAgo, isoDaysFromNow } from './time';

// Template-owned shapes, read from the template props (the templates don't export them).
type ApiKey = NonNullable<ComponentProps<typeof SettingsApiKeysPage>['keys']>[number];
type RolePermission = NonNullable<ComponentProps<typeof SettingsMembersPage>['permissions']>[number];
type ProfileValues = NonNullable<ComponentProps<typeof SettingsProfilePage>['values']>;
type WorkspaceValues = NonNullable<ComponentProps<typeof SettingsWorkspacePage>['values']>;
type RegionOption = NonNullable<ComponentProps<typeof SettingsWorkspacePage>['regions']>[number];
type Connector = NonNullable<ComponentProps<typeof SettingsIntegrationsPage>['connectors']>[number];
type WebhookEndpoint = NonNullable<ComponentProps<typeof SettingsIntegrationsPage>['endpoints']>[number];
type WebhookDelivery = NonNullable<ComponentProps<typeof SettingsIntegrationsPage>['deliveries']>[number];

const minutesAgoIso = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/* Profile */
export const profile: Profile = {
  name: 'Lucía Romero',
  role: 'Owner',
  headline: 'Head of AI operations · keeps the fleet boring',
  meta: [
    { icon: Mail, label: 'lucia@acme-industries.com' },
    { icon: Building2, label: 'AI operations' },
    { icon: MapPin, label: 'Madrid' },
  ],
};
export const profileValues: ProfileValues = { name: 'Lucía Romero', email: 'lucia@acme-industries.com', locale: 'es-ES', timeZone: 'Europe/Madrid' };

/* Notifications */
export const notificationEvents: NotificationEvent[] = [
  { id: 'run-failed', label: 'Run failed', description: 'A run of an agent you own fails or is blocked by a guardrail.' },
  { id: 'agent-degraded', label: 'Agent degraded', description: 'Latency or success rate falls below its SLO.' },
  { id: 'approval', label: 'Approval requested', description: 'A workflow waits for your human review.' },
  { id: 'eval-regression', label: 'Evaluation regression', description: 'A new version scores below its baseline.' },
  { id: 'budget', label: 'Budget threshold', description: 'Model spend reaches 80% or 100% of a budget.' },
  { id: 'security', label: 'Security alerts', description: 'New sign-ins and changes to keys or roles.', locked: ['email'] },
];
export const notificationValue: NotificationMatrixValue = {
  'run-failed': ['email', 'in-app', 'push'],
  'agent-degraded': ['in-app', 'push'],
  approval: ['in-app', 'push'],
  'eval-regression': ['email', 'in-app'],
  budget: ['email'],
  security: ['email', 'in-app'],
};

/* Workspace */
export const workspaceValues: WorkspaceValues = { name: 'Acme Industries', slug: 'acme-industries', region: 'eu-west' };
export const workspaceRegions: RegionOption[] = [
  { value: 'eu-west', label: 'EU West · Ireland' },
  { value: 'eu-central', label: 'EU Central · Frankfurt' },
  { value: 'us-east', label: 'US East · Virginia' },
  { value: 'ap-south', label: 'AP South · Mumbai' },
];

/* Members */
export const members: Member[] = [
  { id: 'm1', name: 'Lucía Romero', email: 'lucia@acme-industries.com', role: 'owner', lastActive: minutesAgoIso(2) },
  { id: 'm2', name: 'Priya Shah', email: 'priya@acme-industries.com', role: 'admin', lastActive: minutesAgoIso(48) },
  { id: 'm3', name: 'Marc Duran', email: 'marc@acme-industries.com', role: 'member', lastActive: minutesAgoIso(60 * 3) },
  { id: 'm4', name: 'Tomás Vidal', email: 'tomas@acme-industries.com', role: 'member', lastActive: minutesAgoIso(60 * 26) },
  { id: 'm5', name: 'Elena Costa', email: 'elena@acme-industries.com', role: 'member', lastActive: minutesAgoIso(60 * 24 * 4) },
  { id: 'm6', name: 'Audit bot', email: 'audit@acme-industries.com', role: 'viewer', lastActive: null },
];
export const invitations: Invitation[] = [
  { id: 'i1', email: 'noah@acme-industries.com', role: 'Member', invitedBy: 'Lucía Romero', invitedAt: isoDaysAgo(1), expiresAt: isoDaysFromNow(6) },
  { id: 'i2', email: 'sara@acme-industries.com', role: 'Admin', invitedBy: 'Priya Shah', invitedAt: isoDaysAgo(9), expiresAt: isoDaysAgo(2) },
];
export const rolePermissions: RolePermission[] = [
  { id: 'view', label: 'View agents, runs and traces', roles: ['owner', 'admin', 'member', 'viewer'] },
  { id: 'deploy', label: 'Create and deploy agents', roles: ['owner', 'admin', 'member'] },
  { id: 'workflows', label: 'Publish workflows', roles: ['owner', 'admin', 'member'] },
  { id: 'keys', label: 'Manage model keys', roles: ['owner', 'admin'] },
  { id: 'members', label: 'Invite and remove members', roles: ['owner', 'admin'] },
  { id: 'billing', label: 'Manage billing and budgets', roles: ['owner'] },
];

/* Billing */
export const plan: BillingPlan = {
  name: 'Enterprise',
  status: 'active',
  priceMonthly: 2400,
  priceAnnual: 2000,
  currency: 'USD',
  renewsOn: isoDaysFromNow(28),
  summary: '50 seats · 3 regions',
  features: ['100 active agents', '2M runs / month', '500M tokens / month', 'Traces kept 90 days', 'SSO, audit log and SLA'],
};
export const quotas: Quota[] = [
  { id: 'runs', label: 'Runs', used: 1_140_000, limit: 2_000_000, projected: 1_620_000, unit: 'runs' },
  { id: 'tokens', label: 'Tokens', used: 412_000_000, limit: 500_000_000, projected: 540_000_000, unit: 'tokens' },
  { id: 'agents', label: 'Active agents', used: 38, limit: 100, unit: 'agents' },
  { id: 'seats', label: 'Seats', used: 6, limit: 50, unit: 'seats' },
];
export const paymentMethod: PaymentMethod = { brand: 'Visa', last4: '4242', expMonth: 8, expYear: 2028, holder: 'Acme Industries S.L.', isDefault: true, status: 'valid' };
export const invoices: Invoice[] = [
  { id: 'inv5', number: 'MM-2026-0009', date: '2026-09-01', amount: 4_812.4, status: 'paid' },
  { id: 'inv4', number: 'MM-2026-0008', date: '2026-08-01', amount: 4_390.15, status: 'paid' },
  { id: 'inv3', number: 'MM-2026-0007', date: '2026-07-01', amount: 3_975.0, status: 'paid' },
  { id: 'inv2', number: 'MM-2026-0006', date: '2026-06-01', amount: 3_520.8, status: 'paid' },
  { id: 'inv1', number: 'MM-2026-0010', date: '2026-10-01', amount: 2_540.0, status: 'open' },
];

/* API keys (musematic's own API, not model providers) */
export const apiScopes: ApiKeyScope[] = [
  { value: 'agents:read', label: 'agents:read', description: 'List and read agents and their versions.' },
  { value: 'agents:write', label: 'agents:write', description: 'Create, update and deploy agents.' },
  { value: 'runs:write', label: 'runs:write', description: 'Start runs and read their traces.' },
  { value: 'evals:read', label: 'evals:read', description: 'Read evaluation results.' },
];
export const apiKeys: ApiKey[] = [
  { id: 'k1', name: 'ci-promote', prefix: 'mm_live_3f9a', scopes: ['agents:read', 'agents:write'], createdAt: isoDaysAgo(120), lastUsedAt: isoDaysAgo(0.02), createdBy: 'Priya Shah' },
  { id: 'k2', name: 'zendesk-bridge', prefix: 'mm_live_81c0', scopes: ['runs:write'], createdAt: isoDaysAgo(64), lastUsedAt: isoDaysAgo(0.001), createdBy: 'Lucía Romero' },
  { id: 'k3', name: 'bi-export', prefix: 'mm_live_c27e', scopes: ['agents:read', 'evals:read'], createdAt: isoDaysAgo(30), lastUsedAt: isoDaysAgo(1), createdBy: 'Elena Costa' },
];

/* Integrations */
export const connectors: Connector[] = [
  { id: 'slack', name: 'Team chat', description: 'Post run failures and approval requests to a channel.', icon: MessageSquare, enabled: true },
  { id: 'helpdesk', name: 'Help desk', description: 'Trigger agents on new tickets and reply in-thread.', icon: Ticket, enabled: true },
  { id: 'source', name: 'Source control', description: 'Run code-reviewer on every pull request.', icon: GitBranch, enabled: true },
  { id: 'crm', name: 'CRM', description: 'Let agents read and update accounts and leads.', icon: Users, enabled: false },
  { id: 'paging', name: 'Incident paging', description: 'Page the owner when an agent fails its SLO.', icon: BellRing, enabled: false },
  { id: 'warehouse', name: 'Data warehouse', description: 'Export runs, traces and costs every night.', icon: Database, enabled: true },
];
export const webhookEndpoints: WebhookEndpoint[] = [
  { id: 'wh1', url: 'https://hooks.acme-industries.com/musematic/runs', events: ['run.failed', 'run.blocked'], status: 'active', lastDeliveryAt: minutesAgoIso(4) },
  { id: 'wh2', url: 'https://ops.acme-industries.com/alerts', events: ['agent.degraded'], status: 'failing', lastDeliveryAt: minutesAgoIso(22) },
];
export const webhookDeliveries: WebhookDelivery[] = [
  { id: 'd1', endpointId: 'wh1', event: 'run.failed', statusCode: 200, durationMs: 131, at: minutesAgoIso(4) },
  { id: 'd2', endpointId: 'wh2', event: 'agent.degraded', statusCode: 503, durationMs: 2050, at: minutesAgoIso(22) },
  { id: 'd3', endpointId: 'wh1', event: 'run.blocked', statusCode: 204, durationMs: 98, at: minutesAgoIso(70) },
  { id: 'd4', endpointId: 'wh2', event: 'agent.degraded', statusCode: null, durationMs: 10000, at: minutesAgoIso(300) },
];
