import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { Field, FieldLabel } from '../../Field';
import { FileInput } from '../FileInput';

export default function FileInputCertificate() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(() => new File(['certificate'], 'certificate.pem'));
  return (
    <form className="w-full max-w-sm space-y-3" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <FieldLabel>{t('fileInput.example.certificate')}</FieldLabel>
        <FileInput
          id="certificate-file"
          name="certificate"
          size="sm"
          value={file}
          onValueChange={setFile}
          accept=".pem,.crt"
          clearable
          placeholder={t('fileInput.example.customPlaceholder')}
        />
      </Field>
      <Button type="reset" variant="secondary">
        {t('fileInput.example.reset')}
      </Button>
    </form>
  );
}
