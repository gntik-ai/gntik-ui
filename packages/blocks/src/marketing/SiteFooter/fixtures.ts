import { Mail, Rss } from 'lucide-react';
import type { SiteFooterColumn, SiteFooterLink, SiteFooterSocialLink } from './SiteFooter';

export const sampleFooterColumns: SiteFooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '/product' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Status', href: '/status' },
    ],
  },
];

export const sampleLegalLinks: SiteFooterLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export const sampleSocialLinks: SiteFooterSocialLink[] = [
  { label: 'Email', href: 'mailto:hello@example.com', icon: Mail },
  { label: 'RSS feed', href: '/feed.xml', icon: Rss },
];
