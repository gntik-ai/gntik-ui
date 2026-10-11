import { PlanCard } from '../PlanCard';

export default function SummaryRenewalOnly() {
  return (
    <PlanCard
      variant="summary"
      plan={{
        name: 'Fixture Plan',
        statusLabel: 'Active',
        renewsOn: '2027-01-01',
      }}
    />
  );
}
