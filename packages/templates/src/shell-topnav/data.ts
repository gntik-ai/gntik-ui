import { appSidebarUser, appTopbarNotifications, firstRunSteps } from '@gntik-ai/blocks';
import { BarChart3, FolderKanban, Home, Rocket, Users } from '@gntik-ai/icons';
import type { NavItem } from '@gntik-ai/ui';

export { appSidebarUser as shellTopnavUser, appTopbarNotifications as shellTopnavNotifications };

export const shellTopnavLinks: NavItem[] = [
  { label: 'Overview', href: '#overview', icon: Home },
  { label: 'Projects', href: '#projects', icon: FolderKanban },
  { label: 'Deployments', href: '#deployments', icon: Rocket },
  { label: 'Analytics', href: '#analytics', icon: BarChart3 },
  { label: 'Members', href: '#members', icon: Users },
];

export const shellTopnavCopy = {
  currentHref: '#projects',
  title: 'Projects',
  description: 'Services, environments and deployments, grouped by project.',
  emptyTitle: 'Create your first project',
  emptyDescription: 'Projects group your services, environments and deployments. Start one from a repository in a couple of minutes.',
  emptyActionLabel: 'New project',
  emptySteps: firstRunSteps,
  footer: '© 2026 Acme Industries · Status · Privacy',
};
