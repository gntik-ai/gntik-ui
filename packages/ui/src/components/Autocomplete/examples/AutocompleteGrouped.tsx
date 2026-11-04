import { useI18n } from '../../../i18n/I18nProvider';
import { Autocomplete, type AutocompleteGroup } from '../Autocomplete';

export default function AutocompleteGrouped() {
  const { t } = useI18n();
  const groups: AutocompleteGroup<string>[] = [
    { label: t('autocomplete.examples.groupIdentity'), items: ['team', 'owner', 'cost-center'] },
    { label: t('autocomplete.examples.groupRouting'), items: ['tier', 'zone', 'route'] },
  ];
  return (
    <div className="w-full max-w-sm">
      <Autocomplete<string>
        label={t('autocomplete.examples.key')}
        placeholder={t('autocomplete.examples.keyPlaceholder')}
        items={groups}
      />
      <p className="mt-2 text-[12px] text-muted-foreground">{t('autocomplete.examples.keyHint')}</p>
    </div>
  );
}
