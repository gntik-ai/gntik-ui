import type { NavItem } from '@gntik-ai/ui';

/** Neutral fixtures for the landing page; sections reuse the marketing block samples. */
export const landingLinks: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Docs', href: '/docs' },
];

export const landingFooterLinks = [
  { label: 'Status', href: '/status' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export const landingCopyright = `© ${new Date().getFullYear()} Example, Inc.`;
