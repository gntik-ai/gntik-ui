import { appSidebarNavGroups, appSidebarUser, appSidebarWorkspaces, firstRunSteps } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

export { appSidebarNavGroups as shellSidebarNav, appSidebarUser as shellSidebarUser, appSidebarWorkspaces as shellSidebarWorkspaces };

export const shellSidebarBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Projects' }];

export const shellSidebarCopy = {
  currentHref: '/projects',
  title: 'Projects',
  description: 'Services, environments and deployments, grouped by project.',
  emptyTitle: 'Create your first project',
  emptyDescription: 'Projects group your services, environments and deployments. Start one from a repository in a couple of minutes.',
  emptyActionLabel: 'New project',
  emptySteps: firstRunSteps,
};
