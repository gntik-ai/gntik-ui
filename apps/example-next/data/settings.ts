import type { DeviceSession } from '@gntik-ai/blocks';
import type { SettingsApiKeysPage, SettingsIntegrationsPage } from '@gntik-ai/templates';
import type { ComponentProps } from 'react';

type ApiKeys = NonNullable<ComponentProps<typeof SettingsApiKeysPage>['keys']>;
type Endpoints = NonNullable<ComponentProps<typeof SettingsIntegrationsPage>['endpoints']>;
type Deliveries = NonNullable<ComponentProps<typeof SettingsIntegrationsPage>['deliveries']>;

/** Settings sections other than profile and members, served by /settings/[section]. */
export const SETTINGS_SECTIONS = ['security', 'notifications', 'appearance', 'workspace', 'billing', 'api-keys', 'integrations'] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
export const isSettingsSection = (s: string): s is SettingsSection => (SETTINGS_SECTIONS as readonly string[]).includes(s);

// Every date is relative to `now` (request time, passed by the Server Component) so SSR and
// hydration render the same timestamps.
const ago = (now: number, minutes: number) => new Date(now - minutes * 60_000).toISOString();
const DAY = 60 * 24;

export const sessionsAt = (now: number): DeviceSession[] => [
  { id: 's1', device: 'Laptop', client: 'Chrome on macOS', kind: 'desktop', location: 'Remote', ip: '192.0.2.10', lastSeen: ago(now, 0), current: true },
  { id: 's2', device: 'Phone', client: 'Mobile app', kind: 'mobile', location: 'Remote', ip: '198.51.100.21', lastSeen: ago(now, 55) },
  { id: 's3', device: 'Workstation', client: 'Firefox on Linux', kind: 'desktop', location: 'Office', ip: '203.0.113.40', lastSeen: ago(now, 9 * DAY) },
];

export const apiKeysAt = (now: number): ApiKeys => [
  { id: 'k1', name: 'ci-pipeline', prefix: 'sk_live_a41c', scopes: ['projects:read', 'projects:write'], createdAt: ago(now, 90 * DAY), lastUsedAt: ago(now, 25), createdBy: 'Alex Morgan' },
  { id: 'k2', name: 'metrics-export', prefix: 'sk_live_7be2', scopes: ['projects:read'], createdAt: ago(now, 21 * DAY), lastUsedAt: ago(now, 2 * DAY), createdBy: 'Jamie Fox' },
  { id: 'k3', name: 'local-dev', prefix: 'sk_live_0d93', scopes: ['projects:read'], createdAt: ago(now, 3 * DAY), lastUsedAt: null, createdBy: 'Kim Ito' },
];

export const endpointsAt = (now: number): Endpoints => [
  { id: 'wh1', url: 'https://hooks.example.com/builds', events: ['deployment.succeeded', 'deployment.failed'], status: 'active', lastDeliveryAt: ago(now, 6) },
  { id: 'wh2', url: 'https://alerts.example.net/incoming', events: ['incident.opened'], status: 'failing', lastDeliveryAt: ago(now, 40) },
];

export const deliveriesAt = (now: number): Deliveries => [
  { id: 'd1', endpointId: 'wh1', event: 'deployment.succeeded', statusCode: 200, durationMs: 128, at: ago(now, 6) },
  { id: 'd2', endpointId: 'wh2', event: 'incident.opened', statusCode: 503, durationMs: 1840, at: ago(now, 40) },
  { id: 'd3', endpointId: 'wh1', event: 'deployment.failed', statusCode: 204, durationMs: 102, at: ago(now, 3 * 60) },
];
