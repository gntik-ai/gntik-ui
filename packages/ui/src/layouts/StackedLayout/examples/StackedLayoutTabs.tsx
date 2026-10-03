import { BarChart3, FolderKanban, Home, Rocket, Users } from 'lucide-react';
import { useState } from 'react';
import { CommandPalette, CommandPaletteTrigger } from '../../../components/CommandPalette';
import type { NavItem } from '../../../components/NavList';
import { NotificationsPopover } from '../../../components/NotificationsPopover';
import { Tabs, TabsList, TabsPanel, TabsTab } from '../../../components/Tabs';
import { UserMenu } from '../../../components/UserMenu';
import { Logo } from '../../../theme/Logo';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { StackedLayout } from '../StackedLayout';

const LINKS: NavItem[] = [
  { label: 'Overview', href: '#overview', icon: Home },
  { label: 'Projects', href: '#projects', icon: FolderKanban },
  { label: 'Deployments', href: '#deployments', icon: Rocket },
  { label: 'Analytics', href: '#analytics', icon: BarChart3 },
  { label: 'Members', href: '#members', icon: Users },
];

const TABS = [
  ['all', 'All projects'],
  ['active', 'Active'],
  ['archived', 'Archived'],
] as const;

export default function StackedLayoutTabs() {
  const [current, setCurrent] = useState('#projects');
  const [tab, setTab] = useState<string>('all');
  return (
    <ThemeProvider storageKey={null}>
      <div className="h-[520px] overflow-hidden rounded-lg border border-border">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="h-full">
          <StackedLayout
            mainId="stacked-layout-main"
            brand={<Logo size={24} wordmark />}
            mobileTitle="Navigation"
            links={LINKS}
            currentHref={current}
            onNavigate={(item) => item.href && setCurrent(item.href)}
            actions={
              <>
                <CommandPalette groups={[{ label: 'Go to', items: LINKS.map((l) => ({ id: l.label, label: l.label, icon: l.icon })) }]} shortcut={false}>
                  <CommandPaletteTrigger className="hidden sm:inline-flex">Search</CommandPaletteTrigger>
                </CommandPalette>
                <NotificationsPopover notifications={[]} />
                <UserMenu user={{ name: 'Dana Whitfield', email: 'dana@example.com' }} onSignOut={() => {}} />
              </>
            }
            subnav={
              <TabsList aria-label="Project filter">
                {TABS.map(([value, label]) => (
                  <TabsTab key={value} value={value}>
                    {label}
                  </TabsTab>
                ))}
              </TabsList>
            }
            footer="© 2026 Acme Industries · Status · Privacy"
          >
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            {TABS.map(([value, label]) => (
              <TabsPanel key={value} value={value} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['web-frontend', 'billing-api', 'auth-service'].map((name) => (
                  <div key={name} className="rounded-[10px] border border-border bg-card p-4">
                    <div className="font-mono text-[13px] font-semibold">{name}</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </TabsPanel>
            ))}
          </StackedLayout>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}
