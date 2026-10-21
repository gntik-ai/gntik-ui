import { Button, I18nProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { DialogWizard, type DialogWizardLabels } from '../DialogWizard';

export default function Labels() {
  const [spanish, setSpanish] = useState(false);
  const [custom, setCustom] = useState(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const labels: Partial<DialogWizardLabels> = {
    title: 'New resource',
    details: 'Configure',
    review: 'Confirm details',
  };
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" aria-pressed={spanish} onClick={() => setSpanish(!spanish)}>
          Spanish catalog
        </Button>
        <Button variant="secondary" aria-pressed={custom} onClick={() => setCustom(!custom)}>
          Custom labels
        </Button>
      </div>
      <I18nProvider locale={spanish ? 'es' : 'en'}>
        <Button onClick={() => setOpen(true)}>Open wizard</Button>
        <DialogWizard
          labels={custom ? labels : undefined}
          open={open}
          onOpenChange={setOpen}
          current={current}
          onStepChange={setCurrent}
          onFinish={() => setOpen(false)}
          description="Configure and review your new resource."
        />
      </I18nProvider>
    </div>
  );
}
