import type { BreadcrumbItem, StatusDotTone } from '@gntik-ai/ui';

export type InboxCategory = 'mention' | 'deployment' | 'billing' | 'access';

export interface InboxNotification {
  id: string;
  title: string;
  /** One-line preview in the list. */
  preview: string;
  /** Full message in the detail pane (paragraphs). */
  body: string[];
  from: string;
  time: Date;
  read: boolean;
  category: InboxCategory;
  /** Colour of the unread dot. */
  tone: StatusDotTone;
  /** Where "Open" leads. */
  href?: string;
}

export const inboxCategoryLabels: Record<InboxCategory, string> = {
  mention: 'Mention',
  deployment: 'Deployment',
  billing: 'Billing',
  access: 'Access',
};

const MIN = 60_000;
const NOW = Date.now();

/** Neutral sample notifications, newest first. */
export const inboxNotifications: InboxNotification[] = [
  {
    id: 'ntf_01',
    title: 'Budget alert: api-gateway at 97%',
    preview: 'Requests will be throttled once the monthly limit is reached.',
    body: [
      'The api-gateway project has used 97% of its monthly budget. Requests will be throttled once the limit is reached.',
      'Raise the limit from Billing or reduce traffic to stay under it until the cycle resets on the 1st.',
    ],
    from: 'Billing',
    time: new Date(NOW - 4 * MIN),
    read: false,
    category: 'billing',
    tone: 'warning',
    href: '/billing',
  },
  {
    id: 'ntf_02',
    title: 'Sam Patel mentioned you in “Release checklist”',
    preview: '@dana can you confirm the rollback plan before Friday?',
    body: ['“@dana can you confirm the rollback plan before Friday? The migration touches the orders table.”', 'Reply in the thread to keep the discussion in one place.'],
    from: 'Sam Patel',
    time: new Date(NOW - 22 * MIN),
    read: false,
    category: 'mention',
    tone: 'primary',
    href: '/projects/web-app/docs/release-checklist',
  },
  {
    id: 'ntf_03',
    title: 'Deployment web-app build 418 succeeded',
    preview: 'Promoted to production in eu-west-1 and us-east-1.',
    body: ['Build 418 of web-app was promoted to production in eu-west-1 and us-east-1.', 'Health checks passed in 42 s. The previous build stays available for instant rollback for 24 hours.'],
    from: 'Deployments',
    time: new Date(NOW - 75 * MIN),
    read: false,
    category: 'deployment',
    tone: 'success',
    href: '/deployments',
  },
  {
    id: 'ntf_04',
    title: 'Deployment orders-api build 212 failed',
    preview: 'Health check timed out in ap-south-1. Traffic stayed on build 211.',
    body: ['Build 212 of orders-api failed its health check in ap-south-1 after 30 s. Traffic stayed on build 211.', 'Open the deployment to see the logs and retry.'],
    from: 'Deployments',
    time: new Date(NOW - 5 * 60 * MIN),
    read: true,
    category: 'deployment',
    tone: 'destructive',
    href: '/deployments',
  },
  {
    id: 'ntf_05',
    title: 'Lee Chen requested access to Billing',
    preview: 'Approve or decline from Members.',
    body: ['Lee Chen asked for a role that includes Billing permissions.', 'Approve or decline the request from the Members page. Requests expire after 7 days.'],
    from: 'Access requests',
    time: new Date(NOW - 26 * 60 * MIN),
    read: true,
    category: 'access',
    tone: 'info',
    href: '/members',
  },
  {
    id: 'ntf_06',
    title: 'Invoice INV-2044 is available',
    preview: '$4,210.00 for September · paid by card ending 4242.',
    body: ['Your September invoice INV-2044 for $4,210.00 was paid with the card ending in 4242.', 'Download the PDF from Billing.'],
    from: 'Billing',
    time: new Date(NOW - 3 * 24 * 60 * MIN),
    read: true,
    category: 'billing',
    tone: 'neutral',
    href: '/billing',
  },
];

export const inboxBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Notifications' }];
