import { Button, I18nProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { CreateApiKeyDialog, type CreateApiKeyDialogLabels } from '../CreateApiKeyDialog';

export default function Labels() {
  const [spanish, setSpanish] = useState(false);
  const [custom, setCustom] = useState(true);
  const labels: Partial<CreateApiKeyDialogLabels> = {
    title: 'New integration key',
    name: 'Integration name',
    submit: 'Generate key',
    successTitle: 'Integration key ready',
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
        <CreateApiKeyDialog labels={custom ? labels : undefined} />
      </I18nProvider>
    </div>
  );
}
