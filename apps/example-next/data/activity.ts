import type { ActivityItem, StatusEvent } from '@gntik-ai/blocks';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/**
 * Timestamps are relative to `now`, which the Server Component passes down (request time), so the
 * server HTML and the client hydrate the exact same dates.
 */
export const activityAt = (NOW: number): ActivityItem[] => [
  { id: 'a1', actor: { name: 'Alex Morgan' }, action: 'deployed', target: 'web-storefront v3.2.0', at: NOW - 9 * MIN },
  { id: 'a2', actor: { name: 'Jamie Fox' }, action: 'approved the release of', target: 'payments-api', at: NOW - 48 * MIN },
  { id: 'a3', actor: { name: 'Kim Ito' }, action: 'invited', target: 'robin@example.com', at: NOW - 3 * HOUR },
  { id: 'a4', actor: { name: 'Alex Morgan' }, action: 'paused', target: 'reports-batch', at: NOW - DAY - 2 * HOUR },
  { id: 'a5', actor: { name: 'Sasha Novak' }, action: 'created the project', target: 'docs-site', at: NOW - 2 * DAY },
];

export const projectEventsAt = (NOW: number): StatusEvent[] => [
  { id: 'e4', status: 'Running', tone: 'success', title: 'Healthy', description: 'All replicas passed health checks.', at: NOW - 0.3 * HOUR, actor: 'System', live: true },
  { id: 'e3', status: 'Deploying', tone: 'info', title: 'Rolling out the latest build', at: NOW - 0.8 * HOUR, actor: 'Alex Morgan' },
  { id: 'e2', status: 'Approved', tone: 'primary', title: 'Release approved', at: NOW - 2 * HOUR, actor: 'Jamie Fox' },
  { id: 'e1', status: 'Created', tone: 'neutral', title: 'Project created', at: NOW - 30 * DAY, actor: 'Sasha Novak' },
];
