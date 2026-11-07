import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Field, FieldLabel } from '../../Field';
import { FileInput } from '../FileInput';

export default function FileInputMultiple() {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="w-full max-w-sm space-y-4">
      <Field>
        <FieldLabel>{t('fileInput.example.multiple')}</FieldLabel>
        <FileInput multiple size="md" clearable value={files} onValueChange={setFiles} />
      </Field>
      <FileInput
        multiple
        value={files}
        onValueChange={setFiles}
        renderValue={(selected) =>
          t('fileInput.example.customValue', { names: selected.map((file) => file.name).join(', ') })
        }
      />
    </div>
  );
}
