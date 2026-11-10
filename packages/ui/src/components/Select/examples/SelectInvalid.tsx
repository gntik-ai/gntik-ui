import { Select, SelectContent, SelectItem, SelectTrigger, SimpleSelect } from '../Select';
import { Field, FieldError, FieldLabel } from '../../Field/Field';
import { Input } from '../../Input/Input';
import { useI18n } from '../../../i18n/I18nProvider';

export default function SelectInvalid() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4" data-select-invalid>
      {(['outline', 'filled', 'ghost'] as const).map((variant) => (
        <div key={variant} className="grid gap-4 sm:grid-cols-2" data-invalid-variant={variant}>
          <Field invalid>
            <FieldLabel required>{t('invalidControls.role')}</FieldLabel>
            <SimpleSelect variant={variant} required items={[{ value: 'member', label: t('fieldVariants.option') }]} />
            <FieldError>{t('invalidControls.chooseRole')}</FieldError>
          </Field>
          <Field invalid>
            <FieldLabel required>{t('invalidControls.name')}</FieldLabel>
            <Input variant={variant} required />
            <FieldError>{t('invalidControls.enterName')}</FieldError>
          </Field>
        </div>
      ))}
      <Field>
        <FieldLabel>{t('invalidControls.role')}</FieldLabel>
        <Select items={[{ value: 'member', label: t('fieldVariants.option') }]}>
          <SelectTrigger invalid />
          <SelectContent>
            <SelectItem value="member">{t('fieldVariants.option')}</SelectItem>
          </SelectContent>
        </Select>
        <FieldError match>{t('invalidControls.chooseRole')}</FieldError>
      </Field>
      <Field>
        <FieldLabel>{t('invalidControls.region')}</FieldLabel>
        <SimpleSelect invalid items={[{ value: 'member', label: t('fieldVariants.option') }]} />
        <FieldError match>{t('invalidControls.chooseRegion')}</FieldError>
      </Field>
    </div>
  );
}
