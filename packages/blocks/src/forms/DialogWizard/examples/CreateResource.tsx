import { Button, Field, FieldLabel, Input, Stack } from '@gntik-ai/ui';
import { useState } from 'react';
import { DescriptionListCard } from '../../../data-display/DescriptionListCard/DescriptionListCard';
import { ValidationSummary } from '../../ValidationSummary/ValidationSummary';
import { DialogWizard } from '../DialogWizard';
import { dialogWizardCopy, dialogWizardSteps } from '../fixtures';

export default function CreateResource() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState('');
  const valid = name.trim().length > 0;
  const finish = () => {
    if (pending) return;
    setPending(true);
    window.setTimeout(() => {
      setCreated(name);
      setOpen(false);
      setPending(false);
    }, 800);
  };
  return <>
    <Button onClick={() => setOpen(true)}>{dialogWizardCopy.title}</Button>
    <p role="status">{created && `Created ${created}`}</p>
    <DialogWizard {...dialogWizardCopy} open={open} onOpenChange={setOpen} steps={dialogWizardSteps} current={current}
      onStepChange={setCurrent} nextDisabled={current === 0 && !valid} onFinish={finish} finishPending={pending}
      stepError={current === 0 && !valid && <ValidationSummary title="A name is required" errors={[{ fieldId: 'resource-name', message: 'Enter a resource name' }]} />}
      reviewStep={<DescriptionListCard title="Review resource" description="Check these answers before creating." items={[{ id: 'name', label: 'Name', value: name }]} />}>
      <Stack gap={4}>
        <h2>{dialogWizardSteps[current]?.label}</h2>
        <Field><FieldLabel>Name</FieldLabel><Input id="resource-name" value={name} onValueChange={setName} /></Field>
      </Stack>
    </DialogWizard>
  </>;
}
