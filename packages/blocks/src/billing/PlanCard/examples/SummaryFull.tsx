import { Button } from "@gntik-ai/ui";
import { PlanCard } from "../PlanCard";

export default function SummaryFull() {
  return (
    <PlanCard
      variant="summary"
      plan={{
        name: "Fixture Plan",
        statusLabel: "Active",
        priceMonthly: 10,
        priceAnnual: 100,
        currency: "EUR",
        cycle: "monthly",
        renewsOn: "2027-01-01",
        features: ["Feature A", "Feature B"],
      }}
      actions={
        <>
          <Button onClick={() => window.alert("Upgrade")}>Upgrade</Button>
          <Button variant="secondary" onClick={() => window.alert("Manage")}>
            Manage
          </Button>
        </>
      }
    />
  );
}
