import type { ConsoleShellProps } from '@gntik-ai/templates';
import { Activity, Bot, FlaskConical, Home, KeyRound, MessageSquare, Server, Settings, Workflow } from '@gntik-ai/icons';
import type { NavGroup, NotificationItem } from '@gntik-ai/ui';
import { minutesAgo, hoursAgo } from './data/time';
import { currentUser } from './data/workspace';
import { navigate } from './router';

/** musematic's sidebar: the product sections, as kit NavList groups. */
export const musematicNav: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Assistant', href: '/assistant', icon: MessageSquare },
    ],
  },
  {
    label: 'Agents & flows',
    items: [
      { label: 'Agents', href: '/agents', icon: Bot, badge: '12' },
      { label: 'Fleet', href: '/fleet', icon: Server },
      { label: 'Workflows', href: '/workflows', icon: Workflow },
      { label: 'Runs', href: '/runs', icon: Activity },
      { label: 'Evaluations', href: '/evaluations', icon: FlaskConical },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Model keys', href: '/settings/model-keys', icon: KeyRound },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

const notifications: NotificationItem[] = [
  { id: 'n1', title: 'security-auditor failed 3 runs in a row', body: 'Blocked by the pii-redaction guardrail.', time: minutesAgo(48), tone: 'destructive' },
  { id: 'n2', title: 'Approval requested', body: 'Support escalation is waiting for human review.', time: minutesAgo(90), tone: 'primary' },
  { id: 'n3', title: 'research-scout is degraded', body: 'web.fetch p95 above its SLO.', time: hoursAgo(5), tone: 'warning', read: true },
];

/** ConsoleShell props for a page: musematic nav, user and topbar; `currentHref` marks the nav item. */
export const shellFor = (currentHref: string): Omit<ConsoleShellProps, 'children' | 'breadcrumbs'> => ({
  nav: musematicNav,
  currentHref,
  workspaces: null,
  user: currentUser,
  storageKey: 'musematic-sidebar',
  topbar: {
    environment: { environment: 'production', region: 'eu-west' },
    notifications,
    theme: 'cycle',
    onSignOut: () => navigate('/sign-in'),
  },
});
