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

/** A product's own settings page, added to the shared section nav. */
export interface SettingsNavExtraItem {
  /** Page id (also the URL segment under `basePath`). */
  id: string;
  label: string;
  icon?: NavGroup['items'][number]['icon'];
  /** Explicit href; defaults to `${basePath}/${id}` when a basePath is set. */
  href?: string;
  /** Group label: "Account", "Workspace" or a new group (appended after them). Default "Workspace". */
  group?: string;
}

/** Title of a built-in settings page; other ids fall back to the id itself. */
export function settingsTitle(page: string): string {
  return (SETTINGS_TITLES as Record<string, string | undefined>)[page] ?? page;
}

/**
 * Section nav shared by every settings template. Items are keyed by page id; pass a `basePath`
 * (e.g. "/settings") to render them as links (`/settings/profile`), otherwise they are buttons
 * and the template's `onNavigate` does the routing. `extraItems` adds a product's own pages,
 * at the end of their group.
 */
export function settingsNav(basePath?: string, extraItems: readonly SettingsNavExtraItem[] = []): NavGroup[] {
  const href = (id: string) => (basePath === undefined ? undefined : `${basePath}/${id}`);
  const item = (id: SettingsPageId, icon: NavGroup['items'][number]['icon']) => ({
    id,
    label: SETTINGS_TITLES[id],
    icon,
    href: href(id),
  });
  const groups: NavGroup[] = [
    {
      label: 'Account',
      items: [item('profile', User), item('security', ShieldCheck), item('notifications', Bell), item('appearance', Palette)],
    },
    {
      label: 'Workspace',
      items: [item('workspace', Building2), item('members', Users), item('billing', CreditCard), item('api-keys', KeyRound), item('integrations', Plug)],
    },
  ];
  for (const extra of extraItems) {
    const label = extra.group ?? 'Workspace';
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items = [...group.items, { id: extra.id, label: extra.label, icon: extra.icon, href: extra.href ?? href(extra.id) }];
  }
  return groups;
}

/** Topbar breadcrumb for a settings page. */
export function settingsBreadcrumbs(page: SettingsPageId | (string & {}), title?: string): BreadcrumbItem[] {
  return [{ label: 'Settings', href: '/settings' }, { label: title ?? settingsTitle(page) }];
}
