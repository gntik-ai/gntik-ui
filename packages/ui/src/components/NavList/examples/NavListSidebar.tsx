import { Activity, BarChart3, ChevronLeft, ChevronRight, CreditCard, FolderKanban, Home, KeyRound, Rocket, ScrollText, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../../Button';
import { LinkProvider } from '../../Link';
import { TooltipProvider } from '../../Tooltip';
import { NavList, type NavGroup } from '../NavList';
import { DemoRouterLink, NavigateContext } from './demo-router';

const GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    collapsible: true,
    items: [
      { label: 'Overview', href: '/overview', icon: Home },
      { label: 'Projects', href: '/projects', icon: FolderKanban, badge: 12 },
      { label: 'Deployments', href: '/deployments', icon: Rocket, badge: '3' },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Operations',
    collapsible: true,
    items: [
      { label: 'Activity', href: '/activity', icon: Activity },
      { label: 'Audit log', href: '/audit-log', icon: ScrollText },
      {
        label: 'Settings',
        icon: Settings,
        items: [
          { label: 'General', href: '/settings/general' },
          { label: 'Members', href: '/settings/members', icon: Users },
          { label: 'Billing', href: '/settings/billing', icon: CreditCard },
          { label: 'API keys', href: '/settings/api-keys', icon: KeyRound },
        ],
      },
    ],
  },
];

export default function NavListSidebar() {
  const [path, setPath] = useState('/projects');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <NavigateContext value={setPath}>
      <LinkProvider component={DemoRouterLink}>
        <TooltipProvider>
          <aside
            className={
              'flex h-[460px] flex-col overflow-hidden rounded-xl border border-border bg-chrome shadow-sm transition-[width] duration-200 motion-reduce:transition-none ' +
              (collapsed ? 'w-[68px]' : 'w-[248px]')
            }
          >
            <div className={'flex h-14 shrink-0 items-center border-b border-border ' + (collapsed ? 'justify-center' : 'justify-between px-3')}>
              {!collapsed && <span className="ps-1 text-[14px] font-semibold tracking-tight text-foreground">Acme Cloud</span>}
              <IconButton
                size="sm"
                icon={collapsed ? ChevronRight : ChevronLeft}
                label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              />
            </div>
            <NavList groups={GROUPS} currentHref={path} collapsed={collapsed} label="Workspace" className="flex-1 overflow-y-auto px-3 py-3" />
          </aside>
        </TooltipProvider>
      </LinkProvider>
    </NavigateContext>
  );
}
