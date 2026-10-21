import { Button, I18nProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { FormSection, type FormSectionLabels } from '../FormSection';

export default function Labels() {
  const [spanish, setSpanish] = useState(false);
  const [custom, setCustom] = useState(true);
  const labels: Partial<FormSectionLabels> = {
    title: 'Workspace details',
    description: 'Manage your workspace information.',
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
        <FormSection labels={custom ? labels : undefined} />
      </I18nProvider>
    </div>
  );
}
