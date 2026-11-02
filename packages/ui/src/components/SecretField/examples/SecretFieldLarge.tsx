import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldLabel } from '../../Field';
import { SecretField } from '../SecretField';

export default function SecretFieldLarge() {
  const { t } = useI18n();
  const [value, setValue] = useState('example-token-1');
  return (
    <Field className="max-w-lg">
      <FieldLabel>{t('credentialDisclosure.secret')}</FieldLabel>
      <SecretField
        size="lg"
        value={value}
        onRotate={() =>
          setValue((previous) => (previous === 'example-token-1' ? 'example-token-2' : 'example-token-1'))
        }
      />
    </Field>
  );
}
