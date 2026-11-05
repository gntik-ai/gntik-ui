import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Autocomplete } from '../Autocomplete';

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-south-1', 'ap-northeast-1'];

/** Free text with suggestions: any region id is accepted, the list only helps. */
export default function AutocompleteRegions() {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  return (
    <div className="w-full max-w-sm">
      <Autocomplete<string>
        label={t('autocomplete.examples.region')}
        placeholder={t('autocomplete.examples.regionPlaceholder')}
        items={REGIONS}
        value={value}
        onValueChange={setValue}
        limit={4}
        clearable
      />
      <p className="mt-2 text-[12px] text-muted-foreground">{t('autocomplete.examples.regionHint')}</p>
    </div>
  );
}
