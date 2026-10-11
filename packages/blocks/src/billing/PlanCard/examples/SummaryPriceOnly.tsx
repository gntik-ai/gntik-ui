import { PlanCard } from '../PlanCard';

export default function SummaryPriceOnly() {
  return (
    <PlanCard
      variant="summary"
      plan={{
        name: 'Fixture Plan',
        statusLabel: 'Active',
        priceMonthly: 10,
        currency: 'EUR',
      }}
    />
  );
}
