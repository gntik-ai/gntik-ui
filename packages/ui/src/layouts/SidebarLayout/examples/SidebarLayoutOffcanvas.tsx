import { useState } from 'react';
import { NavList } from '../../../components/NavList';
import { Logo } from '../../../theme/Logo';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { SidebarLayout } from '../SidebarLayout';
import { NAV_GROUPS } from './shell-demo';

export default function SidebarLayoutOffcanvas() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <ThemeProvider storageKey={null}>
      <div className="h-[420px] overflow-hidden rounded-lg border border-border">
        <SidebarLayout
          mainId="sidebar-offcanvas-main"
          collapseMode="offcanvas"
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          sidebarHeader={<Logo size={24} wordmark />}
          sidebar={<NavList groups={NAV_GROUPS} currentHref="/deployments" label="Workspace" />}
          topbar={<span className="text-[13px] font-medium">Deployments</span>}
        >
          <div className="px-6 py-6">
            <h1 className="text-xl font-bold tracking-tight">Deployments</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Sidebar {collapsed ? 'hidden: the content uses the full width.' : 'visible. Collapse it from the topbar.'}
            </p>
          </div>
        </SidebarLayout>
      </div>
    </ThemeProvider>
  );
}
