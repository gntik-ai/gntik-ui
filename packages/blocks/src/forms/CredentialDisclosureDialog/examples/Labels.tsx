import { Button, I18nProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { CredentialDisclosureDialog, type CredentialDisclosureDialogLabels } from '../CredentialDisclosureDialog';
import { storedDisclosure } from '../fixtures';

export default function Labels() {
  const [spanish, setSpanish] = useState(false);
  const [custom, setCustom] = useState(true);
  const [open, setOpen] = useState(false);
  const labels: Partial<CredentialDisclosureDialogLabels> = {
    title: 'Connection credential',
    description: 'Save this value securely.',
    showLabel: 'Reveal credential',
    hideLabel: 'Mask credential',
    copyLabel: 'Copy credential',
    closeLabel: 'Dismiss',
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
        <Button onClick={() => setOpen(true)}>Show credential</Button>
        <CredentialDisclosureDialog
          labels={custom ? labels : undefined}
          disclosure={open ? storedDisclosure : null}
          onClose={() => setOpen(false)}
        />
      </I18nProvider>
    </div>
  );
}
