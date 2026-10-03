import {
  AppSidebarFooter,
  AppSidebarHeader,
  AppSidebarNav,
  AppTopbar,
  type AppSidebarFooterProps,
  type AppSidebarHeaderProps,
  type AppTopbarProps,
} from '@gntik-ai/blocks';
import { SidebarLayout, type BreadcrumbItem, type NavGroup, type SidebarLayoutProps, type UserMenuUser, type Workspace } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface ConsoleShellProps
  extends Pick<AppSidebarHeaderProps, 'currentWorkspaceId' | 'onWorkspaceChange' | 'onCreateWorkspace'>,
    Pick<AppSidebarFooterProps, 'usage' | 'helpHref' | 'helpLabel' | 'userMenuItems' | 'onSignOut'>,
    Pick<SidebarLayoutProps, 'sidebarLabel' | 'collapseMode'> {
  /** Page content (usually a <Page>). */
  children: ReactNode;
  /** Sidebar navigation; defaults to the AppSidebar sample groups. */
  nav?: NavGroup[];
  /** Href of the current page, marks the active nav item. */
  currentHref?: string;
  breadcrumbs?: BreadcrumbItem[] | null;
  workspaces?: Workspace[] | null;
  user?: UserMenuUser | null;
  /** Extra AppTopbar props (environment, notifications, theme control…). */
  topbar?: Omit<AppTopbarProps, 'breadcrumbs' | 'user'>;
  /** localStorage key for the collapsed sidebar; `undefined` disables persistence. */
  storageKey?: string;
}

/**
 * The console frame shared by the templates: SidebarLayout with the AppSidebar header, nav and
 * footer, and the AppTopbar (breadcrumb, ⌘K search, notifications, theme, user menu).
 * Templates fill it with a Page; products swap the nav, workspaces, user, usage meter, help
 * link and user-menu items.
 */
export function ConsoleShell({
  children,
  nav,
  currentHref,
  breadcrumbs,
  workspaces,
  currentWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
  user,
  usage,
  helpHref,
  helpLabel,
  userMenuItems,
  onSignOut,
  topbar,
  storageKey,
  sidebarLabel,
  collapseMode,
}: ConsoleShellProps) {
  return (
    <SidebarLayout
      fullScreen
      storageKey={storageKey}
      sidebarLabel={sidebarLabel}
      collapseMode={collapseMode}
      sidebarHeader={({ collapsed }) => (
        <AppSidebarHeader
          collapsed={collapsed}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onWorkspaceChange={onWorkspaceChange}
          onCreateWorkspace={onCreateWorkspace}
        />
      )}
      sidebar={({ collapsed }) => <AppSidebarNav groups={nav} currentHref={currentHref} collapsed={collapsed} />}
      sidebarFooter={({ collapsed }) => (
        <AppSidebarFooter
          collapsed={collapsed}
          user={user}
          usage={usage}
          helpHref={helpHref}
          helpLabel={helpLabel}
          userMenuItems={userMenuItems}
          onSignOut={onSignOut}
        />
      )}
      topbar={<AppTopbar breadcrumbs={breadcrumbs} user={user} {...topbar} />}
    >
      {children}
    </SidebarLayout>
  );
}
