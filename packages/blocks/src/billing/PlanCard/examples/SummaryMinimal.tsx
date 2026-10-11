import { PlanCard } from '../PlanCard';

export default function SummaryMinimal() {
  return <PlanCard variant="summary" plan={{ name: 'Fixture Plan', statusLabel: 'Active' }} />;
}
