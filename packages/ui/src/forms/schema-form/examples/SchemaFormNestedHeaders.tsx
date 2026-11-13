import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { SchemaForm } from '../..';
export default function SchemaFormNestedHeaders() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid gap-4">
      <SchemaForm
        schema={{
          type: 'object',
          title: t('schemaForm.example.headers'),
          $defs: {
            header: {
              type: 'object',
              required: ['name', 'value'],
              properties: {
                name: { type: 'string', title: t('schemaForm.example.name') },
                value: { type: 'string', title: t('schemaForm.example.value') },
              },
            },
          },
          properties: {
            headers: {
              type: 'array',
              title: t('schemaForm.example.headers'),
              minItems: 1,
              maxItems: 3,
              items: { $ref: '#/$defs/header' },
            },
          },
        }}
        onSubmit={() => setSaved(true)}
      />
      <p role="status">{saved ? t('schemaForm.example.saved') : ''}</p>
    </div>
  );
}
