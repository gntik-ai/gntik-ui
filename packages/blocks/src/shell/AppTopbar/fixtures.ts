import type { BreadcrumbItem, NotificationItem } from '@gntik-ai/ui';

export const appTopbarBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Acme Industries', href: '/overview' },
  { label: 'Projects', href: '/projects' },
  { label: 'web-frontend', mono: true },
];

const MIN = 60_000;
const NOW = Date.now();

export const appTopbarNotifications: NotificationItem[] = [
  { id: 'n1', tone: 'warning', title: 'api-gateway reached 97% of its monthly budget', body: 'Requests are throttled until the limit is raised.', time: NOW - 2 * MIN },
  { id: 'n2', tone: 'primary', title: 'Deployment web-frontend (build 418) succeeded', time: NOW - 18 * MIN },
  { id: 'n3', tone: 'info', title: 'Sam Patel invited you to Data Platform', time: NOW - 65 * MIN, read: true },
];
