import { Slider } from '../Slider';
import { Field, FieldError, FieldLabel } from '../../Field/Field';
import { useI18n } from '../../../i18n/I18nProvider';

export default function SliderInvalid() {
  const { t } = useI18n();
  return (
    <Field invalid data-slider-invalid>
      <FieldLabel>{t('invalidControls.range')}</FieldLabel>
      <Slider invalid defaultValue={[20, 80]} />
      <FieldError>{t('invalidControls.chooseRange')}</FieldError>
    </Field>
  );
}
