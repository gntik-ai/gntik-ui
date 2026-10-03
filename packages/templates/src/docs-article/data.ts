import { BookOpen, CreditCard, LifeBuoy, Plug, Rocket, Shield } from '@gntik-ai/icons';
import type { BreadcrumbItem, NavGroup, OutlineItem } from '@gntik-ai/ui';

export interface ArticleLink {
  label: string;
  href: string;
}

export const docsNav: NavGroup[] = [
  {
    label: 'Get started',
    items: [
      { label: 'Introduction', href: '/docs', icon: BookOpen },
      { label: 'Deploy a project', href: '/docs/deploy', icon: Rocket },
    ],
  },
  {
    label: 'Guides',
    items: [
      { label: 'Webhooks', href: '/docs/webhooks', icon: Plug },
      { label: 'Access control', href: '/docs/access', icon: Shield },
      { label: 'Billing', href: '/docs/billing', icon: CreditCard },
      { label: 'Support', href: '/docs/support', icon: LifeBuoy },
    ],
  },
];

export const articleToc: OutlineItem[] = [
  { id: 'how-it-works', label: 'How signing works' },
  { id: 'verify', label: 'Verify a signature' },
  { id: 'verify-node', label: 'Node.js example', level: 3 },
  { id: 'replay', label: 'Reject replayed events' },
  { id: 'rotate', label: 'Rotate the secret' },
];

export const verifyCode = `import { createHmac, timingSafeEqual } from 'node:crypto';

export function verify(payload: string, header: string, secret: string) {
  const [timestamp, signature] = header.split(',');
  const expected = createHmac('sha256', secret)
    .update(\`\${timestamp}.\${payload}\`)
    .digest('hex');
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature ?? ''));
}`;

export const articlePrev: ArticleLink = { label: 'Create a webhook', href: '/docs/webhooks/create' };
export const articleNext: ArticleLink = { label: 'Retry failed deliveries', href: '/docs/webhooks/retries' };

export const articleBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'Guides', href: '/docs/guides' },
  { label: 'Verify webhook signatures' },
];

export interface SignatureHeader {
  name: string;
  example: string;
  description: string;
}

export const signatureHeaders: SignatureHeader[] = [
  { name: 'Signature', example: 't=1727950000,v1=5f2b…', description: 'Timestamp and HMAC-SHA256 of the payload.' },
  { name: 'Event-Id', example: 'evt_8Kq2…', description: 'Unique per event; use it to drop duplicates.' },
  { name: 'Event-Type', example: 'project.deployed', description: 'What happened; matches the subscription.' },
];
