import { AppSidebarFooter, AppSidebarHeader, AppSidebarNav, AppTopbar, type AppTopbarProps } from '@gntik-ai/blocks';
import { SidebarLayout, type BreadcrumbItem, type NavGroup, type UserMenuUser, type Workspace } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface ConsoleShellProps {
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
 * Templates fill it with a Page; products swap the nav, workspaces and user.
 */
export function ConsoleShell({ children, nav, currentHref, breadcrumbs, workspaces, user, topbar, storageKey }: ConsoleShellProps) {
  return (
    <SidebarLayout
      fullScreen
      storageKey={storageKey}
      sidebarHeader={({ collapsed }) => <AppSidebarHeader collapsed={collapsed} workspaces={workspaces} />}
      sidebar={({ collapsed }) => <AppSidebarNav groups={nav} currentHref={currentHref} collapsed={collapsed} />}
      sidebarFooter={({ collapsed }) => <AppSidebarFooter collapsed={collapsed} user={user} />}
      topbar={<AppTopbar breadcrumbs={breadcrumbs} user={user} {...topbar} />}
    >
      {children}
    </SidebarLayout>
  );
}
