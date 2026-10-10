import { PlanCard } from "../PlanCard";

export default function SummaryZeroPrice() {
  return (
    <PlanCard
      variant="summary"
      plan={{
        name: "Fixture Plan",
        statusLabel: "Active",
        priceMonthly: 0,
        currency: "EUR",
      }}
    />
  );
}
