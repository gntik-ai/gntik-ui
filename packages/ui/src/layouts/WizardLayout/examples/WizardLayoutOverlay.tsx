import { useState } from 'react';
import { Button } from '../../../components/Button';
import { WizardLayout } from '../WizardLayout';

export default function WizardLayoutOverlay({ explicitFullscreen = false }: { explicitFullscreen?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const steps = [{ label: 'Details' }, { label: 'Configuration' }, { label: 'Review' }];
  return <>
    <Button onClick={() => setOpen(true)}>Create resource</Button>
    <WizardLayout mode="overlay" {...(explicitFullscreen ? { size: 'fullscreen' as const } : {})}
      open={open} onOpenChange={setOpen} title="Create resource" description="Configure a new resource."
      steps={steps} current={current} onStepChange={setCurrent} onFinish={() => setOpen(false)}>
      <h2>{steps[current]?.label}</h2><input aria-label="Resource name" />
    </WizardLayout>
  </>;
}
