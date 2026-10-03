import type { ActivityItem } from './ActivityFeed';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/** Relative to load time so the docs always show Today / Yesterday groups. */
const NOW = Date.now();

/** Project activity, newest first. */
export const PROJECT_ACTIVITY: ActivityItem[] = [
  { id: 'a1', actor: { name: 'Ana Lopez' }, action: 'deployed', target: 'orders-api v2.14.0', at: NOW - 12 * MIN },
  { id: 'a2', actor: { name: 'Sam Carter' }, action: 'approved the release of', target: 'orders-api', at: NOW - 40 * MIN },
  { id: 'a3', actor: { name: 'Priya Nair' }, action: 'invited', target: 'jordan@example.com', at: NOW - 2 * HOUR },
  { id: 'a4', actor: { name: 'Ana Lopez' }, action: 'rotated the API key', target: 'billing-sync', at: NOW - DAY - HOUR },
  { id: 'a5', actor: { name: 'Lee Wong' }, action: 'paused', target: 'nightly-export', at: NOW - DAY - 5 * HOUR },
  { id: 'a6', actor: { name: 'Priya Nair' }, action: 'created the project', target: 'Checkout', at: NOW - 3 * DAY },
];
