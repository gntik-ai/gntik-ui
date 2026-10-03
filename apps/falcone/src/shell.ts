import type { ConsoleShellProps } from '@gntik-ai/templates';
import { BarChart3, Boxes, Cpu, Home, KeyRound, ScrollText, Settings, Workflow } from '@gntik-ai/icons';
import type { NavGroup, NotificationItem } from '@gntik-ai/ui';
import { currentTenant, currentUser, tenants } from './data/tenant';
import { hoursAgo, minutesAgo } from './data/time';
import { navigate } from './router';

/** Falcone's sidebar: the product sections, as kit NavList groups. */
export const falconeNav: NavGroup[] = [
  {
    label: 'Tenant',
    items: [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Usage', href: '/usage', icon: BarChart3 },
    ],
  },
  {
    label: 'Build',
    items: [
      { label: 'Projects', href: '/projects', icon: Boxes, badge: '6' },
      { label: 'Functions', href: '/functions', icon: Cpu },
      { label: 'Workflows', href: '/workflows', icon: Workflow },
    ],
  },
  {
    label: 'Govern',
    items: [
      { label: 'Audit log', href: '/audit', icon: ScrollText },
      { label: 'Model providers', href: '/settings/model-providers', icon: KeyRound },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

const notifications: NotificationItem[] = [
  { id: 'n1', title: 'report-builder failed to deploy', body: 'render-pdf ran out of memory on staging.', time: hoursAgo(9), tone: 'destructive' },
  { id: 'n2', title: 'support-copilot breached its p95 SLO', body: 'draft-reply at 2.9 s (SLO 2 s).', time: hoursAgo(2), tone: 'warning' },
  { id: 'n3', title: 'checkout-api promoted to prod', body: 'Release r-213 is serving 100% of traffic.', time: minutesAgo(18), tone: 'primary', read: true },
];

/** ConsoleShell props for a page: Falcone nav, tenants, quota meter and topbar; `currentHref` marks the nav item. */
export const shellFor = (currentHref: string): Omit<ConsoleShellProps, 'children' | 'breadcrumbs'> => ({
  nav: falconeNav,
  currentHref,
  workspaces: tenants,
  currentWorkspaceId: currentTenant.id,
  user: currentUser,
  usage: { label: 'Invocations', value: 193, max: 250, valueLabel: '193M / 250M' },
  helpHref: null,
  storageKey: 'falcone-sidebar',
  topbar: {
    environment: { environment: 'production', region: 'eu-west' },
    notifications,
    theme: 'cycle',
    onSignOut: () => navigate('/sign-in'),
  },
});
