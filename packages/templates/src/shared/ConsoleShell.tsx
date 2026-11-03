import { ChartLocaleProvider } from '@gntik-ai/charts';
import {
  AppSidebarFooter,
  AppSidebarHeader,
  AppSidebarNav,
  AppTopbar,
  type AppSidebarFooterProps,
  type AppSidebarHeaderProps,
  type AppTopbarProps,
} from '@gntik-ai/blocks';
import {
  SidebarLayout,
  useI18n,
  useNavigation,
  type BreadcrumbItem,
  type NavGroup,
  type SidebarLayoutProps,
  type UserMenuUser,
  type Workspace,
} from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface ConsoleShellProps
  extends
    Omit<AppSidebarHeaderProps, 'collapsed' | 'className' | 'workspaces'>,
    Pick<
      AppSidebarFooterProps,
      'usage' | 'helpHref' | 'helpLabel' | 'userMenuItems' | 'userMenuChildren' | 'onSignOut'
    >,
    Pick<SidebarLayoutProps, 'sidebarLabel' | 'collapseMode'> {
  /** Page content (usually a <Page>). */
  children: ReactNode;
  /** Sidebar navigation; defaults to the NavigationProvider's groups, else the AppSidebar sample groups. */
  nav?: NavGroup[];
  /** Href of the current page, marks the active nav item; defaults to the NavigationProvider's active menu item. */
  currentHref?: string;
  /** Topbar trail; defaults to the NavigationProvider's active page. `null` hides it. */
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
 * link and user-menu items. Inside a NavigationProvider, an omitted `nav`, `currentHref` or
 * `breadcrumbs` comes from the route tree; explicit props always win, and without a provider the
 * defaults are unchanged.
 */
export function ConsoleShell({
  children,
  nav: navProp,
  currentHref: currentHrefProp,
  breadcrumbs: breadcrumbsProp,
  workspaces,
  currentWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
  user,
  usage,
  helpHref,
  helpLabel,
  userMenuItems,
  userMenuChildren,
  brand,
  onSignOut,
  topbar,
  storageKey,
  sidebarLabel,
  collapseMode,
  ...contextProps
}: ConsoleShellProps) {
  const { locale } = useI18n();
  const navigation = useNavigation();
  const nav = navProp ?? navigation?.groups;
  const currentHref =
    currentHrefProp ?? (navigation ? (navigation.activePage?.menuHref ?? navigation.pathname) : undefined);
  const breadcrumbs =
    breadcrumbsProp === undefined && navigation ? (navigation.activePage?.breadcrumbs ?? null) : breadcrumbsProp;
  return (
    <ChartLocaleProvider locale={locale}>
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
            brand={brand}
            {...contextProps}
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
            userMenuChildren={userMenuChildren}
            onSignOut={onSignOut}
          />
        )}
        topbar={
          brand == null ? (
            <AppTopbar breadcrumbs={breadcrumbs} user={user} {...topbar} />
          ) : (
            <>
              <div className="min-w-0 shrink-0 lg:hidden">{brand}</div>
              <AppTopbar breadcrumbs={breadcrumbs} user={user} {...topbar} />
            </>
          )
        }
      >
        {children}
      </SidebarLayout>
    </ChartLocaleProvider>
  );
}
