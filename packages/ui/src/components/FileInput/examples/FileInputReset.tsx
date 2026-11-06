import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Field, FieldLabel } from '../../Field';
import { FileInput } from '../FileInput';

export default function FileInputReset() {
  const { t } = useI18n();
  const [file] = useState(() => new File(['certificate'], 'default.pem'));
  const [preserve, setPreserve] = useState(false);
  return (
    <div className="w-full max-w-sm space-y-3">
      <Checkbox label={t('fileInput.example.preserveReset')} checked={preserve} onCheckedChange={setPreserve} />
      <form
        className="space-y-3"
        onSubmit={(event) => event.preventDefault()}
        onReset={(event) => {
          if (preserve) event.preventDefault();
        }}
      >
        <Field>
          <FieldLabel>{t('fileInput.example.defaultValue')}</FieldLabel>
          <FileInput name="defaultCertificate" defaultValue={file} accept=".pem,.crt" clearable />
        </Field>
        <Button type="reset" variant="secondary">
          {t('fileInput.example.reset')}
        </Button>
      </form>
    </div>
  );
}
