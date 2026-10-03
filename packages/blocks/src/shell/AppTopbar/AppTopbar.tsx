import {
  Breadcrumbs,
  NotificationsPopover,
  ThemeCycleButton,
  ThemeSwitcher,
  UserMenu,
  cn,
  type BreadcrumbItem,
  type NotificationItem,
  type UserMenuEntry,
  type UserMenuUser,
} from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { appSidebarUser } from '../AppSidebar/fixtures';
import { EnvironmentBadge, type EnvironmentBadgeProps } from '../EnvironmentBadge/EnvironmentBadge';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { appTopbarBreadcrumbs, appTopbarNotifications } from './fixtures';

export interface AppTopbarProps {
  /** Location trail; `null` hides it. */
  breadcrumbs?: BreadcrumbItem[] | null;
  /** Replaces the breadcrumb (custom title, tabs…). */
  breadcrumb?: ReactNode;
  /** Environment chip after the breadcrumb; `null` hides it. */
  environment?: EnvironmentBadgeProps | null;
  /** Search control; defaults to GlobalSearch (⌘K). `null` hides it. */
  search?: ReactNode;
  /** Notifications; `null` hides the bell. */
  notifications?: NotificationItem[] | null;
  onNotificationSelect?: (notification: NotificationItem) => void;
  onMarkAllRead?: () => void;
  /** Theme control: a one-button cycle, the segmented switcher, or none. */
  theme?: 'cycle' | 'segmented' | null;
  /** Signed-in user; `null` hides the user menu. */
  user?: UserMenuUser | null;
  userMenuItems?: UserMenuEntry[];
  onSignOut?: () => void;
  className?: string;
}

/**
 * Topbar contents: breadcrumb (+ environment chip) on the left; ⌘K search, notifications, theme
 * and user menu on the right. Renders no <header>: put it in SidebarLayout's `topbar` slot or a
 * header of your own.
 */
export function AppTopbar({
  breadcrumbs = appTopbarBreadcrumbs,
  breadcrumb,
  environment = {},
  search,
  notifications = appTopbarNotifications,
  onNotificationSelect,
  onMarkAllRead,
  theme = 'cycle',
  user = appSidebarUser,
  userMenuItems,
  onSignOut,
  className,
}: AppTopbarProps) {
  const searchNode = search === undefined ? <GlobalSearch className="hidden md:inline-flex" /> : search;
  return (
    <div className={cn('flex min-w-0 flex-1 items-center gap-2 lg:gap-3', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {breadcrumb ?? (breadcrumbs && <Breadcrumbs className="min-w-0" items={breadcrumbs} />)}
        {environment && <EnvironmentBadge {...environment} className={cn('hidden sm:inline-flex', environment.className)} />}
      </div>
      {searchNode}
      {notifications && <NotificationsPopover notifications={notifications} onSelect={onNotificationSelect} onMarkAllRead={onMarkAllRead} />}
      {theme === 'cycle' && <ThemeCycleButton />}
      {theme === 'segmented' && <ThemeSwitcher size="sm" className="hidden md:inline-flex" />}
      {user && <UserMenu user={user} items={userMenuItems} onSignOut={onSignOut} />}
    </div>
  );
}
