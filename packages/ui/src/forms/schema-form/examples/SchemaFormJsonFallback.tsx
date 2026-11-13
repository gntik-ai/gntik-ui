import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { SchemaForm } from '../..';
export default function SchemaFormJsonFallback() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid gap-4">
      <SchemaForm
        schema={{
          type: 'object',
          title: t('schemaForm.example.advanced'),
          properties: {
            config: {
              title: t('schemaForm.example.config'),
              description: t('schemaForm.example.jsonHelp'),
              if: { properties: { enabled: { const: true } } },
              then: { required: ['value'] },
              default: {},
            },
          },
        }}
        onSubmit={() => setSaved(true)}
      />
      <p role="status">{saved ? t('schemaForm.example.saved') : ''}</p>
    </div>
  );
}
