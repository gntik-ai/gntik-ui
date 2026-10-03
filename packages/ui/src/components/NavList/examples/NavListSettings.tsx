import { Bell, Building2, CreditCard, Plug, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { NavList, type NavGroup } from '../NavList';

export default function NavListSettings() {
  const [active, setActive] = useState('members');
  const item = (id: string, label: string, extra: Partial<NavGroup['items'][number]> = {}) => ({
    id,
    label,
    current: active === id,
    onClick: () => setActive(id),
    ...extra,
  });
  const groups: NavGroup[] = [
    {
      items: [
        item('profile', 'Profile', { icon: User }),
        item('notifications', 'Notifications', { icon: Bell, badge: 4 }),
        item('security', 'Security', { icon: Shield }),
      ],
    },
    {
      label: 'Organization',
      items: [
        { label: 'Workspace', icon: Building2, items: [item('general', 'General'), item('members', 'Members'), item('roles', 'Roles')] },
        { label: 'Billing', icon: CreditCard, items: [item('plan', 'Plan'), item('invoices', 'Invoices')] },
        item('integrations', 'Integrations', { icon: Plug, disabled: true }),
      ],
    },
  ];
  return <NavList groups={groups} label="Settings" className="w-60" />;
}
