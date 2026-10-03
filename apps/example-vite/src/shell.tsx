import { GlobalSearch } from '@gntik-ai/blocks';
import { FolderKanban, FolderPlus, UserPlus } from '@gntik-ai/icons';
import type { ConsoleShellProps } from '@gntik-ai/templates';
import type { CommandItem } from '@gntik-ai/ui';
import { topbarNotifications } from './data/inbox';
import { projects } from './data/projects';
import { currentUser, navGroups, userMenuItems, workspaces } from './data/workspace';
import { navigate } from './router';

type ShellOptions = Omit<ConsoleShellProps, 'children'>;

const go = (to: string) => () => navigate(to);

/** ⌘K: every sidebar page, the projects and a few actions, all wired to the router. */
const searchPages: CommandItem[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ id: `page-${item.label}`, label: item.label, icon: item.icon, onSelect: go(item.href ?? '/') })),
);
const searchRecords: CommandItem[] = projects.map((p) => ({
  id: `project-${p.id}`,
  label: p.name,
  icon: FolderKanban,
  mono: true,
  description: `Project · ${p.region}`,
  onSelect: go(`/projects/${p.id}`),
}));
const searchActions: CommandItem[] = [
  { id: 'new-project', label: 'Create project', icon: FolderPlus, keywords: ['new'], onSelect: go('/projects/new') },
  { id: 'invite', label: 'Invite member', icon: UserPlus, keywords: ['team', 'people'], onSelect: go('/settings/members') },
];

/**
 * The console frame every signed-in page shares: the app's nav, workspaces, user and topbar.
 * Pass it to a template's `shell` prop; `currentHref` marks the active sidebar item.
 */
export function shell(currentHref: string): ShellOptions {
  return {
    nav: navGroups,
    currentHref,
    workspaces,
    user: currentUser,
    storageKey: 'acme-sidebar',
    topbar: {
      search: <GlobalSearch className="hidden md:inline-flex" pages={searchPages} records={searchRecords} actions={searchActions} recent={[]} />,
      notifications: topbarNotifications,
      onNotificationSelect: go('/inbox'),
      userMenuItems,
      onSignOut: go('/sign-in'),
    },
  };
}
