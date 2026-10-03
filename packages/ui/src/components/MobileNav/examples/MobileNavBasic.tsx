import { BarChart3, CreditCard, FolderKanban, Home, Rocket, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import type { NavGroup } from '../../NavList';
import { MobileNav } from '../MobileNav';

const GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', icon: Home },
      { label: 'Projects', href: '#projects', icon: FolderKanban, badge: 12 },
      { label: 'Deployments', href: '#deployments', icon: Rocket },
      { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Members', href: '#members', icon: Users },
      { label: 'Billing', href: '#billing', icon: CreditCard },
      { label: 'Settings', href: '#settings', icon: Settings },
    ],
  },
];

export default function MobileNavBasic() {
  const [current, setCurrent] = useState('#projects');
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-chrome px-3 py-2.5">
      <MobileNav
        title="Acme Cloud"
        groups={GROUPS}
        currentHref={current}
        onNavigate={(item) => item.href && setCurrent(item.href)}
      />
      <span className="text-[14px] font-semibold tracking-tight text-foreground">Acme Cloud</span>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground">{current.slice(1)}</span>
    </div>
  );
}
