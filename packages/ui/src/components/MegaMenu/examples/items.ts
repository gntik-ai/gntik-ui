import { BarChart3, BookOpen, CreditCard, FileText, FolderKanban, LifeBuoy, Rocket, Users } from 'lucide-react';
import type { MegaMenuItem } from '../MegaMenu';

export const megaMenuItems: MegaMenuItem[] = [
  { label: 'Overview', href: '#overview' },
  {
    label: 'Workspace',
    sections: [
      {
        title: 'Build',
        links: [
          { label: 'Projects', href: '#projects', icon: FolderKanban, description: 'Every project, its environments and owners.' },
          { label: 'Deployments', href: '#deployments', icon: Rocket, description: 'Releases, rollbacks and deploy gates.' },
        ],
      },
      {
        title: 'Operate',
        links: [
          { label: 'Analytics', href: '#analytics', icon: BarChart3, description: 'Usage, latency and error budgets.' },
          { label: 'Members', href: '#members', icon: Users, description: 'Invite people and manage roles.' },
        ],
      },
    ],
  },
  {
    label: 'Billing',
    sections: [
      {
        links: [
          { label: 'Plan & usage', href: '#plan', icon: CreditCard, description: 'Your plan, seats and this month’s usage.' },
          { label: 'Invoices', href: '#invoices', icon: FileText, description: 'Download and export past invoices.' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        title: 'Learn',
        links: [
          { label: 'Documentation', href: '#docs', icon: BookOpen, description: 'Guides and API reference.' },
          { label: 'Support', href: '#support', icon: LifeBuoy, description: 'Open a ticket or check status.' },
        ],
      },
    ],
  },
];
