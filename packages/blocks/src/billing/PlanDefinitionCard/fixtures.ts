import type { PlanDefinition } from "./PlanDefinitionCard";

export const samplePlanDefinition: PlanDefinition = {
  name: "Workspace",
  slug: "workspace",
  description: "Shared capabilities and quotas for a workspace.",
  status: "active",
  capabilities: { Search: true, Export: false },
  quotas: { Requests: 10000, Storage: "20 GB" },
  tenantCount: 4,
  updatedAt: "2027-01-01",
};
