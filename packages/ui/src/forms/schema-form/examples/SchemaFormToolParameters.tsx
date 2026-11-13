import { useState } from 'react';
import { Switch } from '../../../components/Switch';
import { useI18n } from '../../../i18n';
import { SchemaForm, type JsonSchema } from '../..';
export default function SchemaFormToolParameters() {
  const { t } = useI18n();
  const [disabled, setDisabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const schema: JsonSchema = {
    type: 'object',
    title: t('schemaForm.example.tool'),
    required: ['query'],
    properties: {
      query: { type: 'string', title: t('schemaForm.example.query'), minLength: 2 },
      limit: { type: 'integer', title: t('schemaForm.example.limit'), minimum: 1, maximum: 50, default: 10 },
      safe: { type: 'boolean', title: t('schemaForm.example.safe'), default: true },
      region: {
        title: t('schemaForm.example.region'),
        oneOf: (['us', 'eu', 'apac'] as const).map((value) => ({
          const: value,
          title: t(`schemaForm.example.${value}`),
        })),
      },
      tags: { type: 'array', title: t('schemaForm.example.tags'), items: { type: 'string' }, maxItems: 4 },
    },
  };
  return (
    <div className="grid gap-4">
      <Switch checked={disabled} onCheckedChange={setDisabled} label={t('schemaForm.example.disabled')} />
      <SchemaForm
        schema={schema}
        columns={2}
        disabled={disabled}
        submitLabel={t('schemaForm.example.run')}
        ui={{
          limit: { order: 0 },
          query: { placeholder: t('schemaForm.example.placeholder'), description: t('schemaForm.example.queryHelp') },
        }}
        onChange={() => setSaved(false)}
        onSubmit={() => setSaved(true)}
      />
      <p role="status">{saved ? t('schemaForm.example.saved') : ''}</p>
    </div>
  );
}
