import {
  DEPLOYMENT_DETAILS,
  DEPLOYMENT_EVENTS,
  PROJECT_ACTIVITY,
  type ActivityItem,
  type DangerZoneAction,
  type DescriptionItem,
  type PageHeaderMetaItem,
  type StatusEvent,
} from '@gntik-ai/blocks';
import { Clock, GitBranch, Globe } from '@gntik-ai/icons';
import type { BreadcrumbItem } from '@gntik-ai/ui';

/** The editable part of the resource (Settings tab). */
export interface ResourceSettings {
  name: string;
  description: string;
}

export const detailResource = {
  name: 'orders-api',
  status: 'running',
  description: 'Public REST API for orders, carts and checkout.',
} as const;

export const detailBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Deployments', href: '/deployments' },
  { label: detailResource.name, mono: true },
];

export const detailMeta: PageHeaderMetaItem[] = [
  { label: 'Region', value: 'eu-west-1', icon: Globe, mono: true },
  { label: 'Branch', value: 'main', icon: GitBranch, mono: true },
  { label: 'Last deploy', value: '12 min ago', icon: Clock },
];
export const detailItems: DescriptionItem[] = DEPLOYMENT_DETAILS;
export const detailEvents: StatusEvent[] = DEPLOYMENT_EVENTS;
export const detailActivity: ActivityItem[] = PROJECT_ACTIVITY;

export const detailDangerActions: DangerZoneAction[] = [
  {
    id: 'pause',
    title: 'Pause deployment',
    description: 'Stops serving traffic until you resume it. Configuration is kept.',
    actionLabel: 'Pause',
    destructive: false,
  },
  {
    id: 'delete',
    title: 'Delete deployment',
    description: `Permanently deletes ${detailResource.name}, its secrets and history. This cannot be undone.`,
    actionLabel: 'Delete deployment',
    confirmText: detailResource.name,
  },
];
