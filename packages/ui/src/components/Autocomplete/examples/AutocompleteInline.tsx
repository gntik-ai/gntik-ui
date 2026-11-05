import { useI18n } from '../../../i18n/I18nProvider';
import { Autocomplete } from '../Autocomplete';

const NAMES = ['LOG_LEVEL', 'LOG_FORMAT', 'PORT', 'PUBLIC_URL', 'TZ'];

/** `mode="both"`: the rest of the first match is selected while typing; Backspace removes it. */
export default function AutocompleteInline() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-sm">
      <Autocomplete<string>
        label={t('autocomplete.examples.inline')}
        placeholder={t('autocomplete.examples.inlinePlaceholder')}
        items={NAMES}
        mode="both"
      />
      <p className="mt-2 text-[12px] text-muted-foreground">{t('autocomplete.examples.inlineHint')}</p>
    </div>
  );
}
