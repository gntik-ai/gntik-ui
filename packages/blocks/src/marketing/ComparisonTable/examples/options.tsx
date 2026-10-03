import { ComparisonTable, type ComparisonPlan, type ComparisonSection } from '../ComparisonTable';

const options: ComparisonPlan[] = [
  { id: 'shared', name: 'Shared runner' },
  { id: 'dedicated', name: 'Dedicated runner' },
  { id: 'self-hosted', name: 'Self-hosted' },
];

const sections: ComparisonSection[] = [
  {
    id: 'capacity',
    title: 'Capacity',
    features: [
      { id: 'cpu', label: 'vCPU', values: { shared: 2, dedicated: 8, 'self-hosted': 'Your hardware' } },
      { id: 'jobs', label: 'Concurrent jobs', values: { shared: 1, dedicated: 10, 'self-hosted': 'Unlimited' } },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    features: [
      { id: 'managed', label: 'Managed updates', values: { shared: true, dedicated: true, 'self-hosted': false } },
      { id: 'network', label: 'Private networking', values: { shared: false, dedicated: { value: true, note: 'VPC peering' }, 'self-hosted': true } },
    ],
  },
];

/** Options (not priced plans) inside a settings page: no title, no CTAs, a recommended column. */
export default function RunnerOptionsComparison() {
  return (
    <ComparisonTable
      plans={options}
      sections={sections}
      highlightedPlanId="dedicated"
      highlightLabel="Best for teams"
      eyebrow={null}
      title={null}
      caption="Runner options"
      showFeatureHeader
      featureHeader="Capability"
      className="p-0 sm:p-0"
    />
  );
}
