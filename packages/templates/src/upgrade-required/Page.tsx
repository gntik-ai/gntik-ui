import { InlineCallout, PageHeader, PricingTable, type PricingCycle, type PricingTier } from '@gntik-ai/blocks';
import { MessageSquare } from '@gntik-ai/icons';
import { Page, Stack, type BreadcrumbItem } from '@gntik-ai/ui';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { upgradeBreadcrumbs, upgradeContent, upgradeTiers } from './data';

export interface UpgradeRequiredProps {
  /** The locked feature, e.g. "Audit log". */
  feature: string;
  /** Lowest plan that includes it. */
  requiredPlan: string;
  currentPlan: string;
  description: string;
  tiers: PricingTier[];
  /** Id of the tier the workspace is on (badge + disabled "Current plan" CTA). */
  currentTierId: string;
  /** Called with the chosen tier and billing cycle. */
  onUpgrade: (tier: PricingTier, cycle: PricingCycle) => void;
  onContactSales: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Plan gate: ConsoleShell + Page with PageHeader, a current-plan callout and a PricingTable. */
export default function UpgradeRequiredPage(props: Partial<UpgradeRequiredProps>) {
  const {
    feature = upgradeContent.feature,
    requiredPlan = upgradeContent.requiredPlan,
    currentPlan = upgradeContent.currentPlan,
    description = upgradeContent.description,
    tiers = upgradeTiers,
    currentTierId = 'starter',
    onUpgrade,
    onContactSales,
    breadcrumbs = upgradeBreadcrumbs,
    currentHref = '/settings',
    shell,
  } = props;
  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={`${feature} is available on ${requiredPlan}`}
            description={description}
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'Contact sales', icon: MessageSquare, variant: 'secondary', onClick: onContactSales }]}
          />
        }
      >
        <Stack gap={2}>
          <InlineCallout
            tone="info"
            title={`Your workspace is on the ${currentPlan} plan`}
            description={`Upgrade to ${requiredPlan} or above to turn on ${feature.toLowerCase()}. Your data and settings carry over.`}
            actions={[]}
          />
          <PricingTable
            className="px-0 py-8 sm:px-0 sm:py-10"
            eyebrow={null}
            title="Compare plans"
            description="Switch at any time. Upgrades apply immediately and are prorated."
            tiers={tiers}
            currentTierId={currentTierId}
            onSelectTier={(tier, cycle) => {
              if (tier.id !== currentTierId) onUpgrade?.(tier, cycle);
            }}
          />
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
