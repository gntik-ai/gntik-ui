import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { FileInput } from '../FileInput';

export default function FileInputServiceAccount() {
  const { t, formatBytes } = useI18n();
  const [rejected, setRejected] = useState(0);
  return (
    <form className="w-full max-w-sm space-y-3" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <FieldLabel>{t('fileInput.example.serviceAccount')}</FieldLabel>
        <FileInput
          name="credentials"
          accept=".json,application/json"
          maxSize={1_000_000}
          clearable
          onReject={(files) => setRejected(files.length)}
        />
        <FieldDescription>{t('upload.hint', { types: 'JSON', size: formatBytes(1_000_000) })}</FieldDescription>
      </Field>
      {rejected > 0 && (
        <p role="status" className="text-sm text-destructive-text">
          {t('upload.rejected', { count: rejected })}
        </p>
      )}
      <Button type="reset" variant="secondary">
        {t('fileInput.example.reset')}
      </Button>
    </form>
  );
}
