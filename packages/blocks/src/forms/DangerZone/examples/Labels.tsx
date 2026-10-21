import { Button, I18nProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { DangerZone, type DangerZoneLabels } from '../DangerZone';

export default function Labels() {
  const [spanish, setSpanish] = useState(false);
  const [custom, setCustom] = useState(true);
  const labels: Partial<DangerZoneLabels> = {
    title: 'Sensitive actions',
    description: 'Review these changes carefully.',
    cancel: 'Keep resource',
    confirmPrompt: (text) => <>Enter {text} to proceed</>,
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
        <DangerZone labels={custom ? labels : undefined} />
      </I18nProvider>
    </div>
  );
}
