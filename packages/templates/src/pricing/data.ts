import { BarChart3, BookOpen, FileText, FolderKanban, LifeBuoy, Rocket, Shield } from '@gntik-ai/icons';
import type { MegaMenuItem } from '@gntik-ai/ui';

/** Public navigation: product panels plus plain links. */
export const publicMenu: MegaMenuItem[] = [
  {
    label: 'Product',
    sections: [
      {
        title: 'Build',
        links: [
          { label: 'Projects', href: '/product/projects', icon: FolderKanban, description: 'Every project, its environments and owners.' },
          { label: 'Deployments', href: '/product/deployments', icon: Rocket, description: 'Previews, rollbacks and deploy gates.' },
        ],
      },
      {
        title: 'Operate',
        links: [
          { label: 'Analytics', href: '/product/analytics', icon: BarChart3, description: 'Usage, latency and error budgets.' },
          { label: 'Security', href: '/product/security', icon: Shield, description: 'SSO, roles and audit logs.' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        links: [
          { label: 'Documentation', href: '/docs', icon: BookOpen, description: 'Guides and API reference.' },
          { label: 'Changelog', href: '/changelog', icon: FileText, description: 'What shipped this month.' },
          { label: 'Support', href: '/contact', icon: LifeBuoy, description: 'Talk to a person.' },
        ],
      },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export const publicFooterLinks = [
  { label: 'Status', href: '/status' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export const publicCopyright = '© Example, Inc.';

/** `true` = included, `false` = not included, a string = the limit. */
export type ComparisonValue = boolean | string;

export interface ComparisonRow {
  feature: string;
  /** Values per tier id. */
  values: Record<string, ComparisonValue>;
}

export interface ComparisonSection {
  title: string;
  rows: ComparisonRow[];
}

/** Plan comparison keyed by the sample tier ids (starter · team · enterprise). */
export const comparisonSections: ComparisonSection[] = [
  {
    title: 'Usage',
    rows: [
      { feature: 'Projects', values: { starter: '1', team: 'Unlimited', enterprise: 'Unlimited' } },
      { feature: 'Members', values: { starter: '3', team: '25', enterprise: 'Unlimited' } },
      { feature: 'Requests per month', values: { starter: '50,000', team: '500,000', enterprise: 'Custom' } },
    ],
  },
  {
    title: 'Features',
    rows: [
      { feature: 'Preview deployments', values: { starter: false, team: true, enterprise: true } },
      { feature: 'Saved views', values: { starter: true, team: true, enterprise: true } },
      { feature: 'Data residency', values: { starter: false, team: false, enterprise: true } },
    ],
  },
  {
    title: 'Security and support',
    rows: [
      { feature: 'Single sign-on', values: { starter: false, team: false, enterprise: true } },
      { feature: 'Audit log', values: { starter: false, team: '30 days', enterprise: '1 year' } },
      { feature: 'Support', values: { starter: 'Community', team: 'Email', enterprise: 'Dedicated' } },
    ],
  },
];

