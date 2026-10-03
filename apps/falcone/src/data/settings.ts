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
import { BellRing, Building2, Database, GitBranch, Mail, MapPin, MessageSquare, Radio } from '@gntik-ai/icons';
import type {
  ApiKey,
  Connector,
  ProfileFormValues,
  RegionOption,
  RolePermission,
  WebhookDelivery,
  WebhookEndpoint,
  WorkspaceValues,
} from '@gntik-ai/templates';
import { isoDaysAgo, isoDaysFromNow } from './time';

const minutesAgoIso = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/* Profile */
export const profile: Profile = {
  name: 'Ingrid Halvorsen',
  role: 'Owner',
  headline: 'Platform lead · Northwind Labs',
  meta: [
    { icon: Mail, label: 'ingrid@northwind-labs.io' },
    { icon: Building2, label: 'Platform engineering' },
    { icon: MapPin, label: 'Oslo' },
  ],
};
export const profileValues: ProfileFormValues = { name: 'Ingrid Halvorsen', email: 'ingrid@northwind-labs.io', locale: 'en-GB', timeZone: 'Europe/Oslo' };

/* Notifications */
export const notificationEvents: NotificationEvent[] = [
  { id: 'deploy-failed', label: 'Deploy failed', description: 'A function or workflow fails to deploy to any stage.' },
  { id: 'slo', label: 'SLO breach', description: 'Error rate or p95 latency crosses a project SLO.' },
  { id: 'quota', label: 'Quota threshold', description: 'A metered quota reaches 80% or 100% of its limit.' },
  { id: 'provider', label: 'Model provider failing', description: 'A bring-your-own-key provider rejects requests.' },
  { id: 'security', label: 'Security alerts', description: 'New sign-ins, MCP tokens and changes to keys or roles.', locked: ['email'] },
];
export const notificationValue: NotificationMatrixValue = {
  'deploy-failed': ['email', 'in-app', 'push'],
  slo: ['in-app', 'push'],
  quota: ['email', 'in-app'],
  provider: ['email', 'in-app'],
  security: ['email', 'in-app'],
};

/* Tenant (the template's "workspace") */
export const workspaceValues: WorkspaceValues = { name: 'Northwind Labs', slug: 'northwind-labs', region: 'eu-west' };
export const workspaceRegions: RegionOption[] = [
  { value: 'eu-west', label: 'EU West · Ireland' },
  { value: 'eu-central', label: 'EU Central · Frankfurt' },
  { value: 'us-east', label: 'US East · Virginia' },
];

/* Members */
export const members: Member[] = [
  { id: 'm1', name: 'Ingrid Halvorsen', email: 'ingrid@northwind-labs.io', role: 'owner', lastActive: minutesAgoIso(3) },
  { id: 'm2', name: 'Omar Haddad', email: 'omar@northwind-labs.io', role: 'admin', lastActive: minutesAgoIso(52) },
  { id: 'm3', name: 'Lukas Brandt', email: 'lukas@northwind-labs.io', role: 'admin', lastActive: minutesAgoIso(60 * 3) },
  { id: 'm4', name: 'Mei Tanaka', email: 'mei@northwind-labs.io', role: 'member', lastActive: minutesAgoIso(60 * 4) },
  { id: 'm5', name: 'Release bot', email: 'release-bot@northwind-labs.io', role: 'member', lastActive: minutesAgoIso(18) },
  { id: 'm6', name: 'Finance', email: 'finance@northwind-labs.io', role: 'viewer', lastActive: null },
];
export const invitations: Invitation[] = [
  { id: 'i1', email: 'sofia@northwind-labs.io', role: 'Member', invitedBy: 'Ingrid Halvorsen', invitedAt: isoDaysAgo(1), expiresAt: isoDaysFromNow(6) },
];
export const rolePermissions: RolePermission[] = [
  { id: 'view', label: 'View projects, functions and metrics', roles: ['owner', 'admin', 'member', 'viewer'] },
  { id: 'deploy', label: 'Deploy functions and promote stages', roles: ['owner', 'admin', 'member'] },
  { id: 'workflows', label: 'Publish workflows and channels', roles: ['owner', 'admin', 'member'] },
  { id: 'providers', label: 'Manage model providers and MCP tokens', roles: ['owner', 'admin'] },
  { id: 'members', label: 'Invite and remove members', roles: ['owner', 'admin'] },
  { id: 'billing', label: 'Manage billing and quotas', roles: ['owner'] },
];

/* Billing: plan, metered quotas */
export const plan: BillingPlan = {
  name: 'Scale',
  status: 'active',
  priceMonthly: 990,
  priceAnnual: 825,
  currency: 'USD',
  renewsOn: isoDaysFromNow(28),
  summary: 'Usage-based above the included quotas',
  features: ['250M invocations / month', '2M GB-s of compute', '50 real-time channels', 'BYOK LLM providers', 'Audit log kept 1 year'],
};
export const quotas: Quota[] = [
  { id: 'invocations', label: 'Invocations', used: 193_000_000, limit: 250_000_000, projected: 238_000_000, unit: 'invocations' },
  { id: 'compute', label: 'Compute', used: 1_420_000, limit: 2_000_000, projected: 1_980_000, unit: 'GB-s' },
  { id: 'channels', label: 'Real-time channels', used: 7, limit: 50, unit: 'channels' },
  { id: 'projects', label: 'Projects', used: 6, limit: 25, unit: 'projects' },
];
export const paymentMethod: PaymentMethod = { brand: 'Visa', last4: '4242', expMonth: 3, expYear: 2029, holder: 'Northwind Labs AS', isDefault: true, status: 'valid' };
export const invoices: Invoice[] = [
  { id: 'inv4', number: 'FC-2026-0010', date: '2026-10-01', amount: 8_027.0, status: 'open' },
  { id: 'inv3', number: 'FC-2026-0009', date: '2026-09-01', amount: 7_640.55, status: 'paid' },
  { id: 'inv2', number: 'FC-2026-0008', date: '2026-08-01', amount: 7_112.3, status: 'paid' },
  { id: 'inv1', number: 'FC-2026-0007', date: '2026-07-01', amount: 6_498.9, status: 'paid' },
];

/* API keys (Falcone's management API, not model providers) */
export const apiScopes: ApiKeyScope[] = [
  { value: 'projects:read', label: 'projects:read', description: 'List and read projects, stages and functions.' },
  { value: 'functions:deploy', label: 'functions:deploy', description: 'Deploy functions and promote stages.' },
  { value: 'metering:read', label: 'metering:read', description: 'Read usage and metering per tenant.' },
  { value: 'audit:read', label: 'audit:read', description: 'Read the audit log.' },
];
export const apiKeys: ApiKey[] = [
  { id: 'k1', name: 'ci-deploy', prefix: 'fc_live_2d7e', scopes: ['projects:read', 'functions:deploy'], createdAt: isoDaysAgo(140), lastUsedAt: isoDaysAgo(0.013), createdBy: 'Lukas Brandt' },
  { id: 'k2', name: 'finops-export', prefix: 'fc_live_90ab', scopes: ['metering:read'], createdAt: isoDaysAgo(41), lastUsedAt: isoDaysAgo(1), createdBy: 'Ingrid Halvorsen' },
  { id: 'k3', name: 'siem', prefix: 'fc_live_c3f1', scopes: ['audit:read'], createdAt: isoDaysAgo(12), lastUsedAt: isoDaysAgo(0.002), createdBy: 'Omar Haddad' },
];

/* Integrations */
export const connectors: Connector[] = [
  { id: 'chat', name: 'Team chat', description: 'Post deploy failures and SLO breaches to a channel.', icon: MessageSquare, enabled: true },
  { id: 'source', name: 'Source control', description: 'Deploy to dev on every push, to staging on merge.', icon: GitBranch, enabled: true },
  { id: 'paging', name: 'Incident paging', description: 'Page the project owner when an SLO is breached.', icon: BellRing, enabled: true },
  { id: 'warehouse', name: 'Data warehouse', description: 'Export metering and audit events every night.', icon: Database, enabled: false },
  { id: 'events', name: 'Event bus', description: 'Mirror real-time channel messages to an external bus.', icon: Radio, enabled: false },
];
export const webhookEndpoints: WebhookEndpoint[] = [
  { id: 'wh1', url: 'https://hooks.northwind-labs.io/falcone/deploys', events: ['deploy.failed', 'stage.promoted'], status: 'active', lastDeliveryAt: minutesAgoIso(18) },
  { id: 'wh2', url: 'https://finops.northwind-labs.io/quota', events: ['quota.threshold'], status: 'failing', lastDeliveryAt: minutesAgoIso(140) },
];
export const webhookDeliveries: WebhookDelivery[] = [
  { id: 'd1', endpointId: 'wh1', event: 'stage.promoted', statusCode: 200, durationMs: 118, at: minutesAgoIso(18) },
  { id: 'd2', endpointId: 'wh2', event: 'quota.threshold', statusCode: 502, durationMs: 3010, at: minutesAgoIso(140) },
  { id: 'd3', endpointId: 'wh1', event: 'deploy.failed', statusCode: 204, durationMs: 87, at: minutesAgoIso(540) },
];
