import { useMemo } from 'react';
import { SearchableSelect } from '../SearchableSelect';
import { useI18n } from '../../../i18n/I18nProvider';

export default function SearchableSelectVirtualized() {
  const { t } = useI18n();
  const options = useMemo(
    () =>
      Array.from({ length: 5000 }, (_, index) => ({
        value: index + 1,
        label: t('searchableSelect.examples.node', { number: index + 1 }),
      })),
    [t],
  );
  return (
    <div data-example="searchable-select-virtualized" className="w-full max-w-sm">
      <SearchableSelect
        label={t('searchableSelect.examples.nodes')}
        options={options}
        virtualized
        itemHeight={32}
        overscan={4}
      />
    </div>
  );
}
