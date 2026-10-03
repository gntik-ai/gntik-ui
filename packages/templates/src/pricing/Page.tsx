import { Faq, FeatureGrid, PricingTable, samplePricingTiers, type FaqItem, type Feature, type PricingCycle, type PricingTier } from '@gntik-ai/blocks';
import { Section, Stack, type MegaMenuItem } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { ComparisonTable } from './ComparisonTable';
import { comparisonSections, publicCopyright, publicFooterLinks, publicMenu, type ComparisonSection } from './data';
import { PublicFrame } from './PublicFrame';

export interface PricingProps {
  brand: ReactNode;
  /** MegaMenu items (MobileNav below lg). */
  menu: MegaMenuItem[];
  currentHref: string;
  signInHref: string;
  getStartedHref: string;
  title: ReactNode;
  description: ReactNode;
  tiers: PricingTier[];
  defaultCycle: PricingCycle;
  onSelectTier: (tier: PricingTier, cycle: PricingCycle) => void;
  /** Highlights above the comparison (FeatureGrid); omitted = block samples. */
  features: Feature[];
  comparison: ComparisonSection[];
  faqs: FaqItem[];
  footerLinks: Array<{ label: string; href: string }>;
  copyright: ReactNode;
}

/** Public pricing: StackedLayout + MegaMenu, PricingTable, FeatureGrid, plan comparison table and Faq. */
export default function PricingPage(props: Partial<PricingProps>) {
  const {
    brand,
    menu = publicMenu,
    currentHref = '/pricing',
    signInHref,
    getStartedHref,
    title = 'Simple pricing that grows with you',
    description = 'Start free, upgrade when your team does. Every paid plan has a 14-day trial.',
    tiers = samplePricingTiers,
    defaultCycle,
    onSelectTier,
    features,
    comparison = comparisonSections,
    faqs,
    footerLinks = publicFooterLinks,
    copyright = publicCopyright,
  } = props;
  return (
    <PublicFrame
      brand={brand}
      menu={menu}
      currentHref={currentHref}
      signInHref={signInHref}
      getStartedHref={getStartedHref}
      footerLinks={footerLinks}
      copyright={copyright}
    >
      <Stack gap={12}>
        <PricingTable eyebrow="Pricing" title={title} description={description} tiers={tiers} defaultCycle={defaultCycle} onSelectTier={onSelectTier} />
        <FeatureGrid eyebrow="Every plan" title="Included from day one" features={features} columns={3} />
        <Section title="Compare plans" description="Limits and features side by side.">
          <ComparisonTable tiers={tiers} sections={comparison} caption="Plan comparison" />
        </Section>
        <Faq items={faqs} layout="split" />
      </Stack>
    </PublicFrame>
  );
}
