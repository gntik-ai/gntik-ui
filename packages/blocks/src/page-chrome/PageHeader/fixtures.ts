import { Globe, GitBranch, Clock } from '@gntik-ai/icons';
import type { BreadcrumbItem } from '@gntik-ai/ui';
import type { PageChromeAction } from '../types';
import type { PageHeaderMetaItem, PageHeaderTab } from './PageHeader';

export const pageHeaderBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Projects', href: '#projects' },
  { label: 'acme-web', href: '#acme-web', mono: true },
  { label: 'Deployments' },
];

export const pageHeaderMeta: PageHeaderMetaItem[] = [
  { label: 'Region', value: 'eu-west-1', icon: Globe, mono: true },
  { label: 'Branch', value: 'main', icon: GitBranch, mono: true },
  { label: 'Last deploy', value: '12 min ago', icon: Clock },
];

export const pageHeaderActions: PageChromeAction[] = [
  { label: 'View logs', variant: 'secondary' },
  { label: 'Pause', variant: 'secondary' },
  { label: 'New deployment', variant: 'primary' },
];

export const pageHeaderTabs: PageHeaderTab[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'deployments', label: 'Deployments', count: 1284 },
  { value: 'domains', label: 'Domains' },
  { value: 'settings', label: 'Settings' },
];
