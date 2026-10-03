import { useState } from 'react';
import { LinkProvider } from '../../../components/Link';
import { NavList } from '../../../components/NavList';
import { NavigateContext, DemoRouterLink } from '../../../components/NavList/examples/demo-router';
import { TooltipProvider } from '../../../components/Tooltip';
import { WorkspaceSwitcher } from '../../../components/WorkspaceSwitcher';
import { Logo } from '../../../theme/Logo';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { SidebarLayout } from '../SidebarLayout';
import { DemoTopbar, NAV_GROUPS, WORKSPACES, pageTitle } from './shell-demo';

export default function SidebarLayoutApp() {
  const [path, setPath] = useState('/projects');
  const [workspace, setWorkspace] = useState('acme');
  const title = pageTitle(path);
  return (
    // Apps mount ThemeProvider / LinkProvider once at the root; they are local so the example stands alone.
    <ThemeProvider storageKey={null}>
      <NavigateContext value={setPath}>
        <LinkProvider component={DemoRouterLink}>
          <TooltipProvider>
            <div className="h-[560px] overflow-hidden rounded-lg border border-border">
              <SidebarLayout
                mainId="sidebar-layout-main"
                storageKey="example-sidebar-collapsed"
                sidebarHeader={({ collapsed }) =>
                  collapsed ? (
                    <Logo size={26} />
                  ) : (
                    <WorkspaceSwitcher className="w-full" workspaces={WORKSPACES} currentId={workspace} onSelect={(w) => setWorkspace(w.id)} />
                  )
                }
                sidebar={({ collapsed, closeDrawer }) => (
                  <NavList groups={NAV_GROUPS} currentHref={path} collapsed={collapsed} label="Workspace" onNavigate={closeDrawer} />
                )}
                sidebarFooter={({ collapsed }) =>
                  collapsed ? null : (
                    <div className="rounded-[10px] border border-border bg-card p-2.5">
                      <div className="flex items-center gap-2 text-[11.5px] font-semibold">
                        <span aria-hidden className="size-[7px] rounded-full bg-primary" />
                        Control plane
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-muted-foreground">Operational · 99.98%</div>
                    </div>
                  )
                }
                topbar={<DemoTopbar page={title} />}
              >
                <div className="px-6 py-6">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <p className="mt-1 text-[13px] text-muted-foreground">12 projects · 3 environments · eu-west</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {['web-frontend', 'billing-api', 'auth-service', 'search-indexer', 'media-worker', 'reports'].map((name) => (
                      <div key={name} className="rounded-[10px] border border-border bg-card p-4">
                        <div className="font-mono text-[13px] font-semibold">{name}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">Deployed 2h ago</div>
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarLayout>
            </div>
          </TooltipProvider>
        </LinkProvider>
      </NavigateContext>
    </ThemeProvider>
  );
}
