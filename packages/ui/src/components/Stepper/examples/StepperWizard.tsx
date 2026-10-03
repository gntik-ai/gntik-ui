import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Stepper } from '../Stepper';

const STEPS = [{ label: 'Connect' }, { label: 'Permissions' }, { label: 'Policies' }, { label: 'Review' }];

export default function StepperWizard() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-7">
      <Stepper label="Project setup" steps={STEPS} current={current} onStepClick={setCurrent} />
      <div className="flex items-center justify-center gap-2">
        <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
          Back
        </Button>
        <Button size="sm" trailingIcon={ChevronRight} disabled={current === STEPS.length - 1} onClick={() => setCurrent((c) => Math.min(STEPS.length - 1, c + 1))}>
          Next
        </Button>
      </div>
    </div>
  );
}
