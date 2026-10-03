import type { NotificationInboxPage } from '@gntik-ai/templates';
import type { NotificationItem } from '@gntik-ai/ui';
import type { ItemOf } from './types';

type InboxNotification = ItemOf<typeof NotificationInboxPage, 'notifications'>;

const MIN = 60_000;
const NOW = Date.now();

/** Inbox items, newest first. */
export const notifications: InboxNotification[] = [
  {
    id: 'n1',
    title: 'billing-service is degraded',
    preview: 'Error rate above 2% in eu-central-1 for 10 minutes.',
    body: ['The error rate of billing-service has been above 2% in eu-central-1 for 10 minutes.', 'Open the project to see its status history and roll back if needed.'],
    from: 'Monitoring',
    time: new Date(NOW - 6 * MIN),
    read: false,
    category: 'deployment',
    tone: 'warning',
    href: '/projects/billing-service',
  },
  {
    id: 'n2',
    title: 'Jamie Chen mentioned you in “Launch plan”',
    preview: '@alex can you review the rollout steps before Thursday?',
    body: ['“@alex can you review the rollout steps before Thursday?”', 'Reply in the thread to keep the discussion in one place.'],
    from: 'Jamie Chen',
    time: new Date(NOW - 35 * MIN),
    read: false,
    category: 'mention',
    tone: 'primary',
    href: '/projects/web-app',
  },
  {
    id: 'n3',
    title: 'Priya Shah requested Admin access',
    preview: 'Needs to manage members for the onboarding week.',
    body: ['Priya Shah asked to become an Admin of Acme Inc.', 'Change her role from Members.'],
    from: 'Access',
    time: new Date(NOW - 3 * 60 * MIN),
    read: false,
    category: 'access',
    tone: 'info',
    href: '/settings/members',
  },
  {
    id: 'n4',
    title: 'Invoice INV-2026-0009 is available',
    preview: 'Team plan · September 2026.',
    body: ['Your invoice for September 2026 is ready to download.'],
    from: 'Billing',
    time: new Date(NOW - 26 * 60 * MIN),
    read: true,
    category: 'billing',
    tone: 'primary',
    href: '/settings/billing',
  },
];

/** The same items for the topbar bell. */
export const topbarNotifications: NotificationItem[] = notifications.map((n) => ({
  id: n.id,
  title: n.title,
  body: n.preview,
  time: n.time,
  read: n.read,
  tone: n.tone === 'warning' || n.tone === 'info' || n.tone === 'destructive' ? n.tone : 'primary',
}));
