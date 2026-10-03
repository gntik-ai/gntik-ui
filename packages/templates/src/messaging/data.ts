import type { BreadcrumbItem } from '@gntik-ai/ui';

export interface MessageAttachment {
  id: string;
  name: string;
  size?: number;
  type?: string;
  /** Image preview URL. */
  src?: string;
}

export interface DirectMessage {
  id: string;
  author: string;
  /** Sent by the current user (right-aligned bubble). */
  mine?: boolean;
  text: string;
  at: Date;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  /** Other participants' names. */
  participants: string[];
  unread: number;
  messages: DirectMessage[];
}

export const messagingBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Messages' }];

const MIN = 60_000;
const NOW = Date.now();

/** Neutral illustration: shapes at low opacity in the default fill, readable in every theme. */
const PREVIEW =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill-opacity="0.08"/><circle cx="118" cy="34" r="14" fill-opacity="0.22"/><path d="M0 120 L52 58 L92 100 L118 76 L160 120 Z" fill-opacity="0.3"/></svg>',
  );

export const conversations: Conversation[] = [
  {
    id: 'c-release',
    title: 'Release 2.14',
    participants: ['Priya Natarajan', 'Marcus Chen'],
    unread: 2,
    messages: [
      { id: 'm1', author: 'Priya Natarajan', text: 'Deploy gates are green on staging. Sharing the dashboard before we promote.', at: new Date(NOW - 42 * MIN), attachments: [{ id: 'a1', name: 'staging-dashboard.png', size: 482_000, type: 'image/png', src: PREVIEW }] },
      { id: 'm2', author: 'You', mine: true, text: 'Looks good. Any open incidents on the gateway?', at: new Date(NOW - 38 * MIN) },
      { id: 'm3', author: 'Marcus Chen', text: 'None since Tuesday. Runbook attached in case we need to roll back.', at: new Date(NOW - 12 * MIN), attachments: [{ id: 'a2', name: 'rollback-runbook.pdf', size: 236_000, type: 'application/pdf' }] },
      { id: 'm4', author: 'Priya Natarajan', text: 'Promoting at 15:00 unless someone objects.', at: new Date(NOW - 5 * MIN) },
    ],
  },
  {
    id: 'c-billing',
    title: 'Ana Souza',
    participants: ['Ana Souza'],
    unread: 0,
    messages: [
      { id: 'm1', author: 'Ana Souza', text: 'Can you check the September invoice? The seat count looks off by two.', at: new Date(NOW - 3 * 60 * MIN), attachments: [{ id: 'a1', name: 'invoice-2026-09.csv', size: 18_400, type: 'text/csv' }] },
      { id: 'm2', author: 'You', mine: true, text: 'Two guests were counted as members. I’ll ask billing for a credit.', at: new Date(NOW - 170 * MIN) },
    ],
  },
  {
    id: 'c-onboarding',
    title: 'Onboarding squad',
    participants: ['Jordan Lee', 'Grace Hall', 'Linus Park'],
    unread: 0,
    messages: [{ id: 'm1', author: 'Jordan Lee', text: 'New checklist is live. Completion went from 41% to 63% in the first week.', at: new Date(NOW - 2 * 24 * 60 * MIN) }],
  },
];
