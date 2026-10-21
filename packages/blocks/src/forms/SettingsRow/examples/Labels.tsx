import { Button, I18nProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsRow, type SettingsRowLabels } from '../SettingsRow';

export default function Labels() {
  const [spanish, setSpanish] = useState(false);
  const [custom, setCustom] = useState(true);
  const labels: Partial<SettingsRowLabels> = {
    label: 'Activity notifications',
    description: 'Notify the workspace owners about new activity.',
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
        <SettingsRow labels={custom ? labels : undefined} />
      </I18nProvider>
    </div>
  );
}
