import { CreditCard, FolderKanban, Home, Inbox, Search, Settings, Users } from '@gntik-ai/icons';
import type { NavGroup, UserMenuEntry, UserMenuUser, Workspace } from '@gntik-ai/ui';

/** Product-neutral workspace data: replace with your API. */
export const workspaces: Workspace[] = [
  { id: 'acme', name: 'Acme Inc.', meta: 'Team · Owner' },
  { id: 'acme-labs', name: 'Acme Labs', meta: 'Free · Admin' },
];

export const currentUser: UserMenuUser = { name: 'Alex Rivera', email: 'alex@acme.example' };

export const userMenuItems: UserMenuEntry[] = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Appearance', href: '/settings/appearance' },
];

/** Sidebar navigation. `href`s are the app's routes (see App.tsx). */
export const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Projects', href: '/projects', icon: FolderKanban, badge: 8 },
      { label: 'Inbox', href: '/inbox', icon: Inbox, badge: 3 },
      { label: 'Search', href: '/search', icon: Search },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Members', href: '/settings/members', icon: Users },
      { label: 'Billing', href: '/settings/billing', icon: CreditCard },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];
