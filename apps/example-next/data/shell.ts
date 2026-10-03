import { FolderKanban, Home, Settings, Users } from '@gntik-ai/icons';
import type { NavGroup, UserMenuUser, Workspace } from '@gntik-ai/ui';

/** Sidebar navigation: every href is a route of this app. */
export const nav: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
      { label: 'Projects', href: '/projects', icon: FolderKanban },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Members', href: '/settings/members', icon: Users },
      { label: 'Settings', href: '/settings/profile', icon: Settings },
    ],
  },
];

export const workspaces: Workspace[] = [
  { id: 'northwind', name: 'Northwind', meta: 'Team · Owner' },
  { id: 'sandbox', name: 'Sandbox', meta: 'Free · Owner' },
];

export const user: UserMenuUser = { name: 'Alex Morgan', email: 'alex@example.com' };
