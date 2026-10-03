import { Stepper } from '../Stepper';

const STEPS = [{ label: 'Account' }, { label: 'Workspace' }, { label: 'Invite members' }, { label: 'Billing' }, { label: 'Done' }];

export default function StepperCompact() {
  return (
    <div className="w-72">
      <Stepper label="Onboarding" compact steps={STEPS} current={1} />
    </div>
  );
}
