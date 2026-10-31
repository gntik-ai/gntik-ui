import { CircleHelp } from '@gntik-ai/icons';
import {
  Link,
  Logo,
  Meter,
  NavList,
  SimpleSelect,
  UserMenu,
  WorkspaceSwitcher,
  cn,
  type NavGroup,
  type NavItem,
  type UserMenuEntry,
  type UserMenuUser,
  type Workspace,
} from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import {
  appSidebarNavGroups,
  appSidebarUsage,
  appSidebarUser,
  appSidebarWorkspaces,
  type AppSidebarUsage,
} from './fixtures';

export interface AppSidebarHeaderProps {
  /** Icon rail: shows only the brand mark. */
  collapsed?: boolean;
  /** Workspaces for the switcher; `null` shows the logo + wordmark instead. */
  workspaces?: Workspace[] | null;
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspace: Workspace) => void;
  onCreateWorkspace?: () => void;
  /** Omit to hide the tenant picker. Clearing selects the platform-wide context. */
  tenants?: { id: string; name: string }[];
  currentTenantId?: string | null;
  onTenantSelect?: (id: string | null) => void;
  tenantLabel?: string;
  tenantEmptyText?: string;
  workspaceLabel?: string;
  workspaceEmptyText?: string;
  /** Platform-wide mode: hide all context controls and status. */
  hideWorkspaceContext?: boolean;
  /** Opt into a named section around the controls and status. */
  contextRegionLabel?: string;
  /** Consumer-owned loading state; reset when the context finishes changing. */
  contextBusy?: boolean;
  contextStatus?: ReactNode;
  /** Product-owned identity, rendered in place of the default logo. */
  brand?: ReactNode;
  className?: string;
}

/** Sidebar top: workspace switcher (or the brand logo), the brand mark alone in the icon rail. */
export function AppSidebarHeader({
  collapsed = false,
  workspaces = appSidebarWorkspaces,
  currentWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
  tenants,
  currentTenantId,
  onTenantSelect,
  tenantLabel = 'Tenant',
  tenantEmptyText = 'No tenants',
  workspaceLabel,
  workspaceEmptyText,
  hideWorkspaceContext,
  contextRegionLabel,
  contextBusy,
  contextStatus,
  brand,
  className,
}: AppSidebarHeaderProps) {
  const [current, setCurrent] = useState(currentWorkspaceId ?? workspaces?.[0]?.id ?? '');
  const currentId = currentWorkspaceId ?? current;
  if (collapsed) return brand ?? <Logo size={26} className={className} />;
  if (hideWorkspaceContext) return brand ?? <Logo size={24} wordmark className={cn('px-1', className)} />;
  // Stack the existing slot parent only for opted-in content, without adding a wrapper.
  const stackParent = '[:has(>_&)]:flex-col [:has(>_&)]:items-stretch [:has(>_&)]:gap-2';
  const workspaceControl =
    !workspaces || workspaces.length === 0 ? (
      brand == null && (
        <Logo size={24} wordmark className={cn('px-1', contextStatus != null && stackParent, className)} />
      )
    ) : (
      <WorkspaceSwitcher
        label={workspaceLabel}
        emptyText={workspaceEmptyText}
        className={cn('w-full', (brand != null || contextStatus != null) && stackParent, className)}
        workspaces={workspaces}
        currentId={currentId}
        onCreate={onCreateWorkspace}
        onSelect={(w) => {
          setCurrent(w.id);
          onWorkspaceChange?.(w);
        }}
      />
    );
  // Preserve the original tree path as well as its DOM: Base UI derives IDs from it during SSR.
  if (!tenants && brand == null && !contextRegionLabel && contextStatus == null) return workspaceControl;
  const controls = (
    <>
      {tenants && (
        <SimpleSelect
          items={tenants.map(({ id, name }) => ({ value: id, label: name }))}
          value={currentTenantId}
          onValueChange={(id) => onTenantSelect?.(id)}
          aria-label={tenantLabel}
          placeholder={tenants.length === 0 ? tenantEmptyText : 'Select tenant'}
          clearable
          className="w-full [:has(>_*_>_&)]:flex-col [:has(>_*_>_&)]:items-stretch [:has(>_*_>_&)]:gap-2"
        />
      )}
      {workspaceControl}
      {contextStatus}
    </>
  );
  return (
    <>
      {brand}
      {contextRegionLabel ? (
        <section
          aria-label={contextRegionLabel}
          aria-busy={contextBusy}
          className={cn('flex w-full min-w-0 flex-col gap-2', brand != null && stackParent)}
        >
          {controls}
        </section>
      ) : (
        controls
      )}
    </>
  );
}

export interface AppSidebarNavProps {
  groups?: NavGroup[];
  currentHref?: string;
  collapsed?: boolean;
  /** Accessible name of the nav landmark. */
  label?: string;
  onNavigate?: (item: NavItem) => void;
  className?: string;
}

/** Sidebar body: the NavList (icon rail with tooltips when collapsed). */
export function AppSidebarNav({
  groups = appSidebarNavGroups,
  currentHref = '/projects',
  collapsed = false,
  label = 'Main',
  onNavigate,
  className,
}: AppSidebarNavProps) {
  return (
    <NavList
      groups={groups}
      currentHref={currentHref}
      collapsed={collapsed}
      label={label}
      onNavigate={onNavigate}
      className={className}
    />
  );
}

export interface AppSidebarFooterProps {
  collapsed?: boolean;
  /** Plan usage meter; `null` hides it. */
  usage?: AppSidebarUsage | null;
  /** Help link; `null` hides it. */
  helpHref?: string | null;
  helpLabel?: string;
  /** Signed-in user; `null` hides the user menu. */
  user?: UserMenuUser | null;
  userMenuItems?: UserMenuEntry[];
  /** Extra content inside the account menu popup, before sign out. */
  userMenuChildren?: ReactNode;
  onSignOut?: () => void;
  className?: string;
}

/** Sidebar bottom: usage meter, help link and the user menu (avatar only in the icon rail). */
export function AppSidebarFooter({
  collapsed = false,
  usage = appSidebarUsage,
  helpHref = '#help',
  helpLabel = 'Help & docs',
  user = appSidebarUser,
  userMenuItems,
  userMenuChildren,
  onSignOut,
  className,
}: AppSidebarFooterProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', collapsed && 'items-center', className)}>
      {usage && !collapsed && (
        <div className="rounded-[10px] border border-border bg-card p-2.5">
          <Meter
            size="sm"
            label={usage.label}
            value={usage.value}
            max={usage.max}
            valueLabel={usage.valueLabel}
            aria-valuetext={usage.valueLabel}
          />
        </div>
      )}
      {helpHref && (
        <Link
          href={helpHref}
          tone="muted"
          underline="none"
          aria-label={collapsed ? helpLabel : undefined}
          className={cn(
            'flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium hover:bg-accent/55 hover:text-foreground',
            collapsed && 'size-9 justify-center px-0',
          )}
        >
          <CircleHelp size={16} aria-hidden />
          {!collapsed && helpLabel}
        </Link>
      )}
      {user && (
        <UserMenu
          user={user}
          items={userMenuItems}
          onSignOut={onSignOut}
          showName={!collapsed}
          className={collapsed ? undefined : 'w-full justify-start'}
        >
          {userMenuChildren}
        </UserMenu>
      )}
    </div>
  );
}

export interface AppSidebarProps
  extends
    AppSidebarHeaderProps,
    Omit<AppSidebarNavProps, 'className' | 'groups' | 'label'>,
    Omit<AppSidebarFooterProps, 'className'> {
  navGroups?: NavGroup[];
  navLabel?: string;
}

/**
 * Complete application sidebar column (chrome surface): workspace switcher header, NavList body
 * and a footer with usage, help and the user menu. Inside SidebarLayout, use the parts
 * (AppSidebarHeader / AppSidebarNav / AppSidebarFooter) in its three slots.
 */
export function AppSidebar({
  collapsed = false,
  navGroups,
  navLabel,
  currentHref,
  onNavigate,
  usage,
  helpHref,
  helpLabel,
  user,
  userMenuItems,
  userMenuChildren,
  onSignOut,
  className,
  ...headerProps
}: AppSidebarProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-chrome', collapsed ? 'w-16' : 'w-[248px]', className)}>
      <div className={cn('flex shrink-0 items-center pt-4 pb-3', collapsed ? 'justify-center px-2' : 'px-3')}>
        <AppSidebarHeader collapsed={collapsed} {...headerProps} />
      </div>
      <div className={cn('min-h-0 flex-1 overflow-y-auto pt-1 pb-3', collapsed ? 'px-2' : 'px-3')}>
        <AppSidebarNav
          groups={navGroups}
          label={navLabel}
          currentHref={currentHref}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </div>
      <div className={cn('shrink-0 border-t border-border/60 p-2.5', collapsed && 'px-2')}>
        <AppSidebarFooter
          collapsed={collapsed}
          usage={usage}
          helpHref={helpHref}
          helpLabel={helpLabel}
          user={user}
          userMenuItems={userMenuItems}
          userMenuChildren={userMenuChildren}
          onSignOut={onSignOut}
        />
      </div>
    </div>
  );
}
