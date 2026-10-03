import { Faq, FeatureGrid, Hero, PricingTable, type FaqItem, type Feature, type MarketingAction, type PricingCycle, type PricingTier } from '@gntik-ai/blocks';
import { Button, Link, Logo, StackedLayout, ThemeSwitcher, type NavItem } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { landingCopyright, landingFooterLinks, landingLinks } from './data';

export interface LandingProps {
  /** Logo or product name in the navbar. */
  brand: ReactNode;
  links: NavItem[];
  signInHref: string;
  getStartedHref: string;
  heroTitle: ReactNode;
  heroDescription: ReactNode;
  heroPrimaryAction: MarketingAction | null;
  heroSecondaryAction: MarketingAction | null;
  /** Hero screenshot slot; omit for the block placeholder. */
  heroMedia: ReactNode;
  /** Omitted lists use the marketing block samples. */
  features: Feature[];
  tiers: PricingTier[];
  faqs: FaqItem[];
  onSelectTier: (tier: PricingTier, cycle: PricingCycle) => void;
  footerLinks: Array<{ label: string; href: string }>;
  copyright: ReactNode;
}

/** Public landing: StackedLayout with Hero, FeatureGrid, PricingTable and Faq. */
export default function LandingPage(props: Partial<LandingProps>) {
  const {
    brand = <Logo size={26} wordmark />,
    links = landingLinks,
    signInHref = '/sign-in',
    getStartedHref = '/sign-up',
    heroTitle,
    heroDescription,
    heroPrimaryAction = { label: 'Get started', href: getStartedHref },
    heroSecondaryAction,
    heroMedia,
    features,
    tiers,
    faqs,
    onSelectTier,
    footerLinks = landingFooterLinks,
    copyright = landingCopyright,
  } = props;
  return (
    <StackedLayout
      fullScreen
      width="wide"
      brand={brand}
      links={links}
      navLabel="Primary"
      mobileTitle="Menu"
      actions={
        <>
          <ThemeSwitcher size="sm" className="hidden md:inline-flex" />
          <Button variant="ghost" size="sm" render={<a href={signInHref} />} nativeButton={false}>
            Sign in
          </Button>
          <Button size="sm" render={<a href={getStartedHref} />} nativeButton={false}>
            Get started
          </Button>
        </>
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{copyright}</span>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} tone="muted" underline="hover">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      }
    >
      <Hero title={heroTitle} description={heroDescription} primaryAction={heroPrimaryAction} secondaryAction={heroSecondaryAction} media={heroMedia} />
      <div id="features" className="scroll-mt-20">
        <FeatureGrid features={features} />
      </div>
      <div id="pricing" className="scroll-mt-20">
        <PricingTable tiers={tiers} onSelectTier={onSelectTier} />
      </div>
      <div id="faq" className="scroll-mt-20">
        <Faq items={faqs} />
      </div>
    </StackedLayout>
  );
}
