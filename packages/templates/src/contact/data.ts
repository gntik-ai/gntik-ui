import { BarChart3, BookOpen, FileText, FolderKanban, LifeBuoy, Rocket, Shield } from '@gntik-ai/icons';
import type { MegaMenuItem } from '@gntik-ai/ui';

/** Public navigation: product panels plus plain links. */
export const publicMenu: MegaMenuItem[] = [
  {
    label: 'Product',
    sections: [
      {
        title: 'Build',
        links: [
          { label: 'Projects', href: '/product/projects', icon: FolderKanban, description: 'Every project, its environments and owners.' },
          { label: 'Deployments', href: '/product/deployments', icon: Rocket, description: 'Previews, rollbacks and deploy gates.' },
        ],
      },
      {
        title: 'Operate',
        links: [
          { label: 'Analytics', href: '/product/analytics', icon: BarChart3, description: 'Usage, latency and error budgets.' },
          { label: 'Security', href: '/product/security', icon: Shield, description: 'SSO, roles and audit logs.' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        links: [
          { label: 'Documentation', href: '/docs', icon: BookOpen, description: 'Guides and API reference.' },
          { label: 'Changelog', href: '/changelog', icon: FileText, description: 'What shipped this month.' },
          { label: 'Support', href: '/contact', icon: LifeBuoy, description: 'Talk to a person.' },
        ],
      },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export const publicFooterLinks = [
  { label: 'Status', href: '/status' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export const publicCopyright = '© Example, Inc.';

export type ContactTopic = 'sales' | 'support' | 'billing' | 'partnerships';

export const contactTopics: Array<{ value: ContactTopic; label: string }> = [
  { value: 'sales', label: 'Sales and plans' },
  { value: 'support', label: 'Technical support' },
  { value: 'billing', label: 'Billing' },
  { value: 'partnerships', label: 'Partnerships' },
];

export interface ContactValues {
  name: string;
  email: string;
  company: string;
  topic: ContactTopic | '';
  message: string;
}

export const emptyContact: ContactValues = { name: '', email: '', company: '', topic: '', message: '' };

export interface Office {
  id: string;
  city: string;
  /** Address lines. */
  address: string[];
  email: string;
  phone: string;
  hours: string;
}

export const offices: Office[] = [
  { id: 'lisbon', city: 'Lisbon', address: ['Rua do Exemplo 120', '1200-000 Lisbon, Portugal'], email: 'lisbon@example.com', phone: '+351 210 000 000', hours: 'Mon–Fri, 9:00–18:00 WET' },
  { id: 'toronto', city: 'Toronto', address: ['200 Example Street, Suite 400', 'Toronto, ON M5V 0A0, Canada'], email: 'toronto@example.com', phone: '+1 416 000 0000', hours: 'Mon–Fri, 9:00–17:00 ET' },
  { id: 'singapore', city: 'Singapore', address: ['10 Example Road, #08-01', 'Singapore 018000'], email: 'singapore@example.com', phone: '+65 6000 0000', hours: 'Mon–Fri, 9:00–18:00 SGT' },
];

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!v.name.trim()) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.email = 'Enter a valid email address.';
  if (!v.topic) errors.topic = 'Choose a topic.';
  if (v.message.trim().length < 10) errors.message = 'Tell us a little more (at least 10 characters).';
  return errors;
}
