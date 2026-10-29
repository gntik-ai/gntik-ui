import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SearchableSelect } from '../SearchableSelect';
import { useI18n } from '../../../i18n/I18nProvider';
import { useRegions } from './regions';

export default function SearchableSelectActions() {
  const { t } = useI18n();
  const [managed, setManaged] = useState(false);
  return (
    <div data-example="searchable-select-actions" className="grid w-full max-w-sm gap-2">
      <SearchableSelect
        options={useRegions()}
        label={t('searchableSelect.examples.region')}
        emptyText={t('searchableSelect.examples.customEmpty')}
        searchPlaceholder={t('common.searchPlaceholder')}
        placeholder={t('common.selectPlaceholder')}
        actions={[
          {
            id: 'manage',
            label: t('searchableSelect.examples.manage'),
            icon: Settings,
            onSelect: () => setManaged(true),
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {managed ? t('searchableSelect.examples.managed') : ''}
      </p>
    </div>
  );
}
