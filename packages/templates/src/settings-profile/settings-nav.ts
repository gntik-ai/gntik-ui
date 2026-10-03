import { Bell, Building2, CreditCard, KeyRound, Palette, Plug, ShieldCheck, User, Users } from '@gntik-ai/icons';
import type { BreadcrumbItem, NavGroup } from '@gntik-ai/ui';

/** The nine settings pages, in nav order. */
export type SettingsPageId =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'workspace'
  | 'members'
  | 'billing'
  | 'api-keys'
  | 'integrations';

export const SETTINGS_TITLES: Record<SettingsPageId, string> = {
  profile: 'Profile',
  security: 'Security',
  notifications: 'Notifications',
  appearance: 'Appearance',
  workspace: 'Workspace',
  members: 'Members',
  billing: 'Billing',
  'api-keys': 'API keys',
  integrations: 'Integrations',
};

/**
 * Section nav shared by every settings template. Items are keyed by page id; pass a `basePath`
 * (e.g. "/settings") to render them as links (`/settings/profile`), otherwise they are buttons
 * and the template's `onNavigate` does the routing.
 */
export function settingsNav(basePath?: string): NavGroup[] {
  const item = (id: SettingsPageId, icon: NavGroup['items'][number]['icon']) => ({
    id,
    label: SETTINGS_TITLES[id],
    icon,
    href: basePath === undefined ? undefined : `${basePath}/${id}`,
  });
  return [
    {
      label: 'Account',
      items: [item('profile', User), item('security', ShieldCheck), item('notifications', Bell), item('appearance', Palette)],
    },
    {
      label: 'Workspace',
      items: [item('workspace', Building2), item('members', Users), item('billing', CreditCard), item('api-keys', KeyRound), item('integrations', Plug)],
    },
  ];
}

/** Topbar breadcrumb for a settings page. */
export function settingsBreadcrumbs(page: SettingsPageId): BreadcrumbItem[] {
  return [{ label: 'Settings', href: '/settings' }, { label: SETTINGS_TITLES[page] }];
}
