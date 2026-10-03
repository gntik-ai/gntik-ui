import type { ScheduleEvent } from './events';

/** The sample calendar's "today" (Wed 15 Apr 2026, 10:20). Pass your own `today` in apps. */
export const sampleToday = new Date(2026, 3, 15, 10, 20);

type Row = [day: number, kind: string, title: string, start: number, hours: number, location?: string];

const ROWS: Row[] = [
  [3, 'deploy', 'API gateway v3.1', 10, 1, 'eu-west-1'],
  [7, 'job', 'Data import batch', 6.5, 2],
  [7, 'review', 'Access review', 14, 1, 'eu-west-1'],
  [9, 'backup', 'Snapshot · search index', 11, 1.5],
  [13, 'job', 'Inbox sync', 7, 0.5],
  [13, 'deploy', 'Billing service v2.4 rollout', 9.5, 1.5, 'us-east-1'],
  [13, 'review', 'Access review', 14, 1, 'eu-west-1'],
  [14, 'job', 'Data import batch', 6.5, 2],
  [14, 'backup', 'Snapshot · search index', 11, 1.5],
  [14, 'job', 'Usage rollup', 21, 0.5],
  [15, 'job', 'Inbox sync', 6, 0.5],
  [15, 'job', 'Report export', 7, 0.5],
  [15, 'deploy', 'Checkout hotfix', 9, 1, 'eu-west-1'],
  [15, 'review', 'Compliance review', 10.5, 1.5, 'all regions'],
  [15, 'backup', 'Snapshot · primary database', 13, 1],
  [15, 'job', 'Weekly digest', 15, 0.5],
  [15, 'maintenance', 'Maintenance window', 16, 2, 'ap-south-1'],
  [15, 'job', 'Search reindex', 19, 1],
  [15, 'job', 'Usage rollup', 21.5, 0.5],
  [16, 'job', 'Inbox sync', 7, 0.5],
  [16, 'deploy', 'Notifications v1.8', 13.5, 1, 'us-east-1'],
  [16, 'maintenance', 'Node pool upgrade', 22, 1.5],
  [17, 'review', 'Weekly cost review', 10, 1],
  [17, 'backup', 'Full backup', 22.5, 1],
  [18, 'job', 'Weekend health check', 9, 0.5],
  [19, 'maintenance', 'Certificate rotation', 3, 1],
  [22, 'job', 'Inbox sync', 7, 0.5],
  [22, 'deploy', 'Billing service v2.5', 11, 1, 'us-east-1'],
  [22, 'review', 'Policy review', 15, 1],
  [24, 'job', 'Data import batch', 6.5, 2],
  [28, 'maintenance', 'Maintenance window', 16, 2, 'eu-west-1'],
  [30, 'review', 'Month-end review', 9, 2],
  [30, 'backup', 'Full backup', 22.5, 1],
];

const at = (day: number, hour: number) => new Date(2026, 3, day, Math.floor(hour), Math.round((hour % 1) * 60));

/** Sample scheduled work for April 2026 (jobs, deploys, reviews, backups, maintenance). */
export const sampleEvents: ScheduleEvent[] = ROWS.map(([day, kind, title, start, hours, location], i) => ({
  id: `evt-${i + 1}`,
  title,
  kind,
  start: at(day, start),
  end: at(day, start + hours),
  location,
}));
