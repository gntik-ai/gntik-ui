import { Stepper } from '../Stepper';

const STEPS = [
  { label: 'Build', description: 'Image built and pushed · 1m 12s' },
  { label: 'Run tests', description: '214 passed · 38s' },
  { label: 'Database migration', description: 'Migration 0042 failed to apply', status: 'error' as const },
  { label: 'Deploy', description: 'Waiting for the migration' },
  { label: 'Health checks' },
];

export default function StepperVertical() {
  return (
    <div className="w-72">
      <Stepper label="Deployment pipeline" orientation="vertical" steps={STEPS} current={3} />
    </div>
  );
}
