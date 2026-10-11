import { PlanCard } from '../PlanCard';

export default function SummaryFeaturesOnly() {
  return (
    <PlanCard
      variant="summary"
      plan={{
        name: 'Fixture Plan',
        statusLabel: 'Active',
        features: ['Feature A'],
      }}
    />
  );
}
