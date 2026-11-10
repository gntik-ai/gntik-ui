import { Combobox, ComboboxInput, ComboboxChipsInput } from '../Combobox';
import { Field, FieldError, FieldLabel } from '../../Field/Field';
import { useI18n } from '../../../i18n/I18nProvider';

export default function ComboboxInvalid() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4" data-combobox-invalid>
      {[false, true].map((multiple) => {
        const Control = multiple ? ComboboxChipsInput : ComboboxInput;
        return (
          <Field key={String(multiple)} invalid>
            <FieldLabel>{t('invalidControls.region')}</FieldLabel>
            <Combobox multiple={multiple}>
              <Control invalid aria-label={t('invalidControls.region')} />
            </Combobox>
            <FieldError>{t('invalidControls.chooseRegion')}</FieldError>
          </Field>
        );
      })}
    </div>
  );
}
