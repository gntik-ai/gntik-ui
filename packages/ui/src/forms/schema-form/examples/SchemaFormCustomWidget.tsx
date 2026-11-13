import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useI18n } from '../../../i18n';
import { SchemaForm, toValueProps, type SchemaWidget } from '../..';
const ModelPicker: SchemaWidget = ({ controlProps }) => {
  const { t } = useI18n();
  const p = toValueProps(controlProps);
  return (
    <Input
      {...p}
      value={typeof p.value === 'string' ? p.value : ''}
      placeholder={t('schemaForm.example.modelPlaceholder')}
    />
  );
};
export default function SchemaFormCustomWidget() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid gap-4">
      <SchemaForm
        schema={{
          type: 'object',
          title: t('schemaForm.example.custom'),
          required: ['model'],
          properties: {
            model: { type: 'string', title: t('schemaForm.example.model'), minLength: 3 },
            internal: { type: 'string', default: 'standard' },
          },
        }}
        defaultValues={{ model: '' }}
        widgets={{ model: ModelPicker }}
        ui={{
          model: {
            widget: 'model',
            label: t('schemaForm.example.model'),
            description: t('schemaForm.example.modelHelp'),
          },
          internal: { hidden: true },
        }}
        onSubmit={() => setSaved(true)}
      />
      <p role="status">{saved ? t('schemaForm.example.saved') : ''}</p>
    </div>
  );
}
