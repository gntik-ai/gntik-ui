import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { SchemaForm } from '../..';
export default function SchemaFormProviderSettings() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid gap-4">
      <SchemaForm
        schema={{
          type: 'object',
          title: t('schemaForm.example.provider'),
          properties: {
            auth: {
              type: 'object',
              title: t('schemaForm.example.auth'),
              properties: { token: { type: 'string', title: t('schemaForm.example.token'), writeOnly: true } },
            },
            email: { type: 'string', title: t('schemaForm.example.email'), format: 'email' },
            endpoint: { type: 'string', title: t('schemaForm.example.endpoint'), format: 'uri' },
            start: { type: 'string', title: t('schemaForm.example.start'), format: 'date', default: '2026-10-01' },
            scheduled: { type: 'string', title: t('schemaForm.example.scheduled'), format: 'date-time' },
            note: { type: 'string', title: t('schemaForm.example.note'), maxLength: 500 },
            plan: {
              title: t('schemaForm.example.plan'),
              oneOf: Array.from({ length: 8 }, (_, index) => ({
                const: index + 1,
                title: t('schemaForm.example.planOption', { n: index + 1 }),
              })),
            },
            events: {
              type: 'array',
              title: t('schemaForm.example.events'),
              items: { type: 'string', enum: [t('schemaForm.example.created'), t('schemaForm.example.updated')] },
              uniqueItems: true,
            },
          },
        }}
        onSubmit={() => setSaved(true)}
      />
      <p role="status">{saved ? t('schemaForm.example.saved') : ''}</p>
    </div>
  );
}
