import { Activity, BarChart3, CreditCard, FolderKanban, Home, KeyRound, Rocket, Settings, Users } from 'lucide-react';
import { CommandPalette, CommandPaletteTrigger, type CommandGroup } from '../../../components/CommandPalette';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import type { NavGroup } from '../../../components/NavList';
import { NotificationsPopover, type NotificationItem } from '../../../components/NotificationsPopover';
import { ThemeCycleButton } from '../../../components/ThemeSwitcher';
import { UserMenu } from '../../../components/UserMenu';
import type { Workspace } from '../../../components/WorkspaceSwitcher';

/** Example-only fixtures shared by the SidebarLayout examples. */
export const NAV_GROUPS: NavGroup[] = [
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
    items: [
      { label: 'Activity', href: '/activity', icon: Activity },
      { label: 'Members', href: '/members', icon: Users },
      { label: 'Billing', href: '/billing', icon: CreditCard },
      { label: 'API keys', href: '/api-keys', icon: KeyRound },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export const WORKSPACES: Workspace[] = [
  { id: 'acme', name: 'Acme Industries', meta: 'production · eu-west' },
  { id: 'acme-staging', name: 'Acme Industries', meta: 'staging · eu-west' },
  { id: 'northbeam', name: 'Northbeam Labs', meta: 'production · us-east' },
];

const NOW = Date.now();
const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', tone: 'warning', title: 'api-gateway reached 97% of its monthly budget', time: NOW - 2 * 60_000 },
  { id: 'n2', tone: 'primary', title: 'Deployment web-frontend (build 418) succeeded', time: NOW - 18 * 60_000 },
];

const COMMANDS: CommandGroup[] = [
  {
    label: 'Go to',
    items: NAV_GROUPS.flatMap((g) => g.items).map((item) => ({ id: item.href ?? item.label, label: item.label, icon: item.icon })),
  },
];

/** Topbar used by the examples: breadcrumb, ⌘K, notifications, theme and user menu. */
export function DemoTopbar({ page }: { page: string }) {
  return (
    <>
      <Breadcrumbs className="min-w-0 flex-1" items={[{ label: 'Acme Industries', href: '/overview' }, { label: page }]} />
      <CommandPalette groups={COMMANDS} shortcut={false}>
        <CommandPaletteTrigger className="hidden md:inline-flex">Search</CommandPaletteTrigger>
      </CommandPalette>
      <NotificationsPopover notifications={NOTIFICATIONS} />
      <ThemeCycleButton />
      <UserMenu user={{ name: 'Dana Whitfield', email: 'dana@example.com' }} onSignOut={() => {}} />
    </>
  );
}

export function pageTitle(path: string) {
  return NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === path)?.label ?? 'Overview';
}
