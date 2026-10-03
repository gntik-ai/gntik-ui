import { Activity, BarChart3, CreditCard, FolderKanban, Home, KeyRound, Rocket, Settings, Users } from '@gntik-ai/icons';
import type { NavGroup, UserMenuUser, Workspace } from '@gntik-ai/ui';

export const appSidebarNavGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/overview', icon: Home },
      { label: 'Projects', href: '/projects', icon: FolderKanban, badge: 12 },
      { label: 'Deployments', href: '/deployments', icon: Rocket, badge: 3 },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Admin',
    collapsible: true,
    items: [
      { label: 'Activity', href: '/activity', icon: Activity },
      { label: 'Members', href: '/members', icon: Users },
      { label: 'Billing', href: '/billing', icon: CreditCard },
      { label: 'API keys', href: '/api-keys', icon: KeyRound },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export const appSidebarWorkspaces: Workspace[] = [
  { id: 'acme', name: 'Acme Industries', meta: 'Enterprise · Owner' },
  { id: 'northbeam', name: 'Northbeam Labs', meta: 'Pro · Admin' },
  { id: 'personal', name: 'Personal', meta: 'Free · Owner' },
];

export interface AppSidebarUsage {
  label: string;
  value: number;
  max: number;
  /** Formatted value, e.g. "8.2k / 10k requests". */
  valueLabel?: string;
}

export const appSidebarUsage: AppSidebarUsage = { label: 'Monthly requests', value: 8200, max: 10000, valueLabel: '8.2k / 10k' };

export const appSidebarUser: UserMenuUser = { name: 'Dana Whitfield', email: 'dana@example.com' };
