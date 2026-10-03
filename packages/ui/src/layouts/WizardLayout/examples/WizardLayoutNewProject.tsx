import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { RadioGroup, Radio } from '../../../components/RadioGroup';
import { Logo } from '../../../theme/Logo';
import { WizardLayout } from '../WizardLayout';

const STEPS = [{ label: 'Details' }, { label: 'Region' }, { label: 'Members' }, { label: 'Review' }];

export default function WizardLayoutNewProject() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('billing-sync');
  const [status, setStatus] = useState('');
  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-border">
      <WizardLayout
        logo={<Logo size={22} />}
        title="New project"
        steps={STEPS}
        current={step}
        onStepChange={setStep}
        nextDisabled={step === 0 && name.trim() === ''}
        onFinish={() => setStatus(`Project “${name}” created`)}
        onExit={() => setStatus('Setup cancelled')}
        exitTitle="Leave project setup?"
        exitDescription="The project has not been created yet. Your answers will be discarded."
        footerStart={<span aria-live="polite">{status}</span>}
      >
        {step === 0 && (
          <section aria-labelledby="wizard-details" className="grid gap-5">
            <h1 id="wizard-details" className="text-[20px] font-semibold tracking-tight">Project details</h1>
            <Field>
              <FieldLabel required>Project name</FieldLabel>
              <Input value={name} onValueChange={setName} />
              <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
            </Field>
          </section>
        )}
        {step === 1 && (
          <section aria-labelledby="wizard-region" className="grid gap-5">
            <h1 id="wizard-region" className="text-[20px] font-semibold tracking-tight">Where should it run?</h1>
            <RadioGroup aria-labelledby="wizard-region" defaultValue="eu-west">
              <Radio value="eu-west" label="EU West · Frankfurt" />
              <Radio value="us-east" label="US East · Virginia" />
            </RadioGroup>
          </section>
        )}
        {step === 2 && (
          <section aria-labelledby="wizard-members" className="grid gap-5">
            <h1 id="wizard-members" className="text-[20px] font-semibold tracking-tight">Invite members</h1>
            <Field>
              <FieldLabel>Emails</FieldLabel>
              <Input placeholder="name@example.com, …" />
              <FieldDescription>You can invite more people later.</FieldDescription>
            </Field>
          </section>
        )}
        {step === 3 && (
          <section aria-labelledby="wizard-review" className="grid gap-3">
            <h1 id="wizard-review" className="text-[20px] font-semibold tracking-tight">Review</h1>
            <p className="text-[13.5px] text-muted-foreground">
              <span className="font-medium text-foreground">{name}</span> will be created in EU West with 1 member.
            </p>
          </section>
        )}
      </WizardLayout>
    </div>
  );
}
