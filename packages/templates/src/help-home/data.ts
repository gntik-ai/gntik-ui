import { BookOpen, CreditCard, LifeBuoy, Plug, Rocket, Shield, type LucideIcon } from '@gntik-ai/icons';
import type { NavGroup } from '@gntik-ai/ui';

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  /** Number of articles in the category. */
  articleCount: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  /** Category id. */
  category: string;
  href: string;
  /** Reading time in minutes. */
  minutes: number;
}

export const helpNav: NavGroup[] = [
  {
    label: 'Help center',
    items: [
      { label: 'Home', href: '/help', icon: LifeBuoy },
      { label: 'Get started', href: '/help/get-started', icon: Rocket },
      { label: 'Deployments', href: '/help/deployments', icon: BookOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Billing', href: '/help/billing', icon: CreditCard },
      { label: 'Security', href: '/help/security', icon: Shield },
      { label: 'Integrations', href: '/help/integrations', icon: Plug },
    ],
  },
];

export const helpCategories: HelpCategory[] = [
  { id: 'get-started', title: 'Get started', description: 'Create a workspace, invite your team and ship a first project.', icon: Rocket, href: '/help/get-started', articleCount: 12 },
  { id: 'deployments', title: 'Deployments', description: 'Environments, previews, rollbacks and deploy gates.', icon: BookOpen, href: '/help/deployments', articleCount: 24 },
  { id: 'billing', title: 'Billing', description: 'Plans, invoices, usage limits and payment methods.', icon: CreditCard, href: '/help/billing', articleCount: 9 },
  { id: 'security', title: 'Security', description: 'Single sign-on, two-factor, roles and audit logs.', icon: Shield, href: '/help/security', articleCount: 15 },
  { id: 'integrations', title: 'Integrations', description: 'Webhooks, API keys and connected services.', icon: Plug, href: '/help/integrations', articleCount: 18 },
  { id: 'support', title: 'Contact support', description: 'Open a ticket or check the status page.', icon: LifeBuoy, href: '/help/support', articleCount: 4 },
];

export const helpArticles: HelpArticle[] = [
  { id: 'a1', title: 'Deploy your first project', excerpt: 'From a repository to a running deployment in five minutes.', category: 'get-started', href: '/help/deploy-first-project', minutes: 5 },
  { id: 'a2', title: 'Roll back a deployment', excerpt: 'Promote an earlier deployment or schedule a rollback.', category: 'deployments', href: '/help/roll-back', minutes: 3 },
  { id: 'a3', title: 'Set up single sign-on', excerpt: 'Connect your identity provider with SAML or OIDC.', category: 'security', href: '/help/sso', minutes: 8 },
  { id: 'a4', title: 'Understand your invoice', excerpt: 'Seats, usage and credits, line by line.', category: 'billing', href: '/help/invoice', minutes: 4 },
  { id: 'a5', title: 'Verify webhook signatures', excerpt: 'Check the HMAC header before trusting a payload.', category: 'integrations', href: '/help/webhook-signatures', minutes: 6 },
  { id: 'a6', title: 'Invite members and assign roles', excerpt: 'Owners, admins, members and viewers explained.', category: 'get-started', href: '/help/roles', minutes: 4 },
];

/** Articles whose title or excerpt contains the query. */
export function searchArticles(articles: readonly HelpArticle[], query: string): HelpArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...articles];
  return articles.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
}
