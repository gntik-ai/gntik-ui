import { useState } from 'react';
import { useComboboxFilter } from '../../Combobox';
import { SearchableSelect } from '../SearchableSelect';
import { useI18n } from '../../../i18n/I18nProvider';
import { useRegions } from './regions';

export default function SearchableSelectGrouped() {
  const { t } = useI18n();
  const { contains } = useComboboxFilter();
  const [query, setQuery] = useState('');
  const regions = useRegions();
  return (
    <div data-example="searchable-select-grouped" className="w-full max-w-sm">
      <SearchableSelect
        label={t('searchableSelect.examples.region')}
        options={[
          { label: t('searchableSelect.examples.europe'), options: regions.slice(0, 2) },
          { label: t('searchableSelect.examples.atlantic'), options: regions.slice(2) },
        ]}
        filter={(option, text) => contains(option.label, text)}
        onSearchChange={setQuery}
        size="md"
      />
      <p role="status" className="mt-2 text-xs text-muted-foreground">
        {t('searchableSelect.examples.searchQuery', { query })}
      </p>
    </div>
  );
}
