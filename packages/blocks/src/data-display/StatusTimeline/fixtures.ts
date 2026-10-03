import type { StatusEvent } from './StatusTimeline';

const HOUR = 3_600_000;
/** Fixtures are relative to load time so relative timestamps stay fresh in the docs. */
export const FIXTURE_NOW = Date.now();

/** State changes of a deployment, newest first. */
export const DEPLOYMENT_EVENTS: StatusEvent[] = [
  { id: 'e6', status: 'Running', tone: 'success', title: 'Deployment healthy', description: 'All 3 replicas passed health checks.', at: FIXTURE_NOW - 0.2 * HOUR, actor: 'System', live: true },
  { id: 'e5', status: 'Deploying', tone: 'info', title: 'Rolling out v2.14.0', description: 'Canary at 10%, then 50%, then 100%.', at: FIXTURE_NOW - 0.6 * HOUR, actor: 'Ana Lopez' },
  { id: 'e4', status: 'Approved', tone: 'primary', title: 'Release approved', at: FIXTURE_NOW - 1.5 * HOUR, actor: 'Sam Carter' },
  { id: 'e3', status: 'Degraded', tone: 'warning', title: 'Error rate above 2%', description: 'Alert fired on orders-api.', at: FIXTURE_NOW - 5 * HOUR, actor: 'Monitoring' },
  { id: 'e2', status: 'Failed', tone: 'destructive', title: 'Build failed', description: 'Type check failed in 2 files.', at: FIXTURE_NOW - 26 * HOUR, actor: 'CI' },
  { id: 'e1', status: 'Created', tone: 'neutral', title: 'Deployment created', at: FIXTURE_NOW - 50 * HOUR, actor: 'Ana Lopez' },
];
