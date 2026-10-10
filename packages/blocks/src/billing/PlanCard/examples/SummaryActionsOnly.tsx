import { Button } from "@gntik-ai/ui";
import { PlanCard } from "../PlanCard";

export default function SummaryActionsOnly() {
  return (
    <PlanCard
      variant="summary"
      plan={{ name: "Fixture Plan", statusLabel: "Active" }}
      actions={<Button onClick={() => window.alert("Manage")}>Manage</Button>}
    />
  );
}
