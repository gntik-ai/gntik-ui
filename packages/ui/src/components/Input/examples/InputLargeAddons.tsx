import { Search } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nProvider';
import { IconButton } from '../../Button';
import { CopyButton } from '../../CopyButton';
import { Field, FieldLabel } from '../../Field';
import { Input, InputKbd } from '../Input';

export default function InputLargeAddons() {
  const { t } = useI18n();
  return (
    <div className="grid max-w-lg gap-4">
      <Field>
        <FieldLabel>{t('common.search')}</FieldLabel>
        <Input
          size="lg"
          trailingAddon={<InputKbd>⌘K</InputKbd>}
          leadingAddon={<IconButton icon={Search} label={t('common.search')} />}
        />
      </Field>
      <Field>
        <FieldLabel>{t('credentialDisclosure.secret')}</FieldLabel>
        <Input size="lg" readOnly value="example-token" trailingAddon={<CopyButton value="example-token" />} />
      </Field>
    </div>
  );
}
