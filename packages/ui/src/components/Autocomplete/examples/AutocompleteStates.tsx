import { useI18n } from '../../../i18n/I18nProvider';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { Autocomplete } from '../Autocomplete';

const MODELS = ['model-large', 'model-small', 'model-mini'];

/** Sizes, `invalid` and `disabled` on their own, and Field wiring label, description and error. */
export default function AutocompleteStates() {
  const { t } = useI18n();
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Autocomplete<string> size="sm" items={MODELS} label={t('autocomplete.examples.statesSm')} />
      <Autocomplete<string> size="md" items={MODELS} label={t('autocomplete.examples.statesMd')} />
      <Autocomplete<string> invalid items={MODELS} label={t('autocomplete.examples.statesInvalid')} />
      <Autocomplete<string> disabled items={MODELS} label={t('autocomplete.examples.statesDisabled')} />
      <Field invalid>
        <FieldLabel>{t('autocomplete.examples.statesFieldLabel')}</FieldLabel>
        <Autocomplete<string> items={MODELS} clearable defaultValue="" />
        <FieldDescription>{t('autocomplete.examples.statesFieldDescription')}</FieldDescription>
        <FieldError match>{t('autocomplete.examples.statesFieldError')}</FieldError>
      </Field>
    </div>
  );
}
