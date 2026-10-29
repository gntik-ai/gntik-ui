import { Button } from '../../Button';
import { SearchableSelect } from '../SearchableSelect';
import { useI18n } from '../../../i18n/I18nProvider';

export default function SearchableSelectToolbar() {
  const { t } = useI18n();
  const status = t('searchableSelect.examples.status');
  const options = [
    { value: 'running', label: t('searchableSelect.examples.running') },
    { value: 'failed', label: t('searchableSelect.examples.failed') },
    { value: 'queued', label: t('searchableSelect.examples.queued'), disabled: true },
  ];
  return (
    <div data-example="searchable-select-toolbar" className="grid gap-4">
      <SearchableSelect
        multiple
        aria-label={status}
        defaultValue={['running', 'failed']}
        trigger={
          <Button variant="secondary" size="sm">
            {status}
          </Button>
        }
        options={options}
      />
      <SearchableSelect multiple options={options} label={status} defaultValue={['running', 'failed']} />
    </div>
  );
}
