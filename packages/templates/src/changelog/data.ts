import type { BadgeProps, BreadcrumbItem } from '@gntik-ai/ui';

export type ChangelogTag = 'feature' | 'improvement' | 'fix' | 'security' | 'deprecation';

export interface ChangelogEntry {
  id: string;
  /** Release version, e.g. "2.14". */
  version: string;
  date: string;
  title: string;
  summary: string;
  /** Bullet list of changes. */
  changes: string[];
  tags: ChangelogTag[];
  /** Shows the "New" badge (e.g. released since the viewer's last visit). */
  isNew?: boolean;
  /** "Read more" link. */
  href?: string;
}

export const changelogTagLabels: Record<ChangelogTag, string> = {
  feature: 'Feature',
  improvement: 'Improvement',
  fix: 'Fix',
  security: 'Security',
  deprecation: 'Deprecation',
};

export const changelogTagTones: Record<ChangelogTag, NonNullable<BadgeProps['tone']>> = {
  feature: 'primary',
  improvement: 'info',
  fix: 'neutral',
  security: 'warning',
  deprecation: 'destructive',
};

export const changelogBreadcrumbs: BreadcrumbItem[] = [{ label: 'Help', href: '/help' }, { label: 'Changelog' }];

/** Neutral release notes, newest first. */
export const changelogEntries: ChangelogEntry[] = [
  {
    id: 'v2-14',
    version: '2.14',
    date: '2026-09-29',
    title: 'Deploy gates and scheduled rollbacks',
    summary: 'Block releases while an incident is open, and schedule a rollback for a quiet hour.',
    changes: [
      'Deploy gates check open incidents, failing checks and freeze windows before every release.',
      'Rollbacks can be scheduled; the deployment page shows a countdown and a cancel action.',
      'The deployments table remembers its density and hidden columns per project.',
    ],
    tags: ['feature', 'improvement'],
    isNew: true,
    href: '/changelog/v2-14',
  },
  {
    id: 'v2-13-2',
    version: '2.13.2',
    date: '2026-09-18',
    title: 'Stricter API key scopes',
    summary: 'New keys default to read-only; existing keys keep their scopes.',
    changes: ['Keys created from now on start read-only.', 'Audit log entries now include the key’s last four characters.'],
    tags: ['security'],
    isNew: true,
  },
  {
    id: 'v2-13-1',
    version: '2.13.1',
    date: '2026-09-07',
    title: 'Fixes for usage exports',
    summary: 'CSV exports respect the selected range and time zone again.',
    changes: ['Exports used UTC instead of the workspace time zone.', 'Large exports no longer time out after 30 seconds.'],
    tags: ['fix'],
  },
  {
    id: 'v2-13',
    version: '2.13',
    date: '2026-08-25',
    title: 'Saved views for every table',
    summary: 'Save filters, sorting and columns as a view, and share it with your workspace.',
    changes: ['Saved views on projects, deployments, members and invoices.', 'Views can be private or shared with the workspace.'],
    tags: ['feature'],
  },
  {
    id: 'v2-12',
    version: '2.12',
    date: '2026-08-04',
    title: 'Legacy webhooks are deprecated',
    summary: 'Version 1 webhooks stop on 1 December 2026. Move to signed webhooks before then.',
    changes: ['Signed webhooks include a timestamp and an HMAC header.', 'The integrations page lists every endpoint still on version 1.'],
    tags: ['deprecation', 'security'],
  },
];
