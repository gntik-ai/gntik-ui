import { Button } from '@gntik-ai/ui';
import { PlanDefinitionCard } from '../PlanDefinitionCard';
import { samplePlanDefinition } from '../fixtures';

export default function Compact() {
  return (
    <PlanDefinitionCard
      plan={samplePlanDefinition}
      density="compact"
      actions={
        <>
          <Button onClick={() => window.alert('Edit')}>Edit</Button>
          <a
            href="#tenants"
            className="text-primary-text underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            View tenants
          </a>
        </>
      }
    />
  );
}
