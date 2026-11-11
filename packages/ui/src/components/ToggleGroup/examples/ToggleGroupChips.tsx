import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Toggle, ToggleGroup } from '../ToggleGroup';

const filters = [
  { value: 'all', label: 'toggleGroup.all', count: 12 },
  { value: 'running', label: 'toggleGroup.running', count: 9 },
  { value: 'failed', label: 'toggleGroup.failed', count: 3 },
] as const;

export default function ToggleGroupChips() {
  const { t } = useI18n();
  const [value, setValue] = useState(['failed']);
  return (
    <div className="flex flex-col items-start gap-5">
      <ToggleGroup variant="chip" aria-label={t('toggleGroup.status')} value={value} onValueChange={setValue}>
        {filters.map((filter) => (
          <Toggle key={filter.value} value={filter.value} count={filter.count}>
            {t(filter.label)}
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup
        variant="chip"
        aria-label={t('toggleGroup.statusMultiple')}
        multiple
        defaultValue={['failed']}
        size="sm"
      >
        {filters.map((filter) => (
          <Toggle key={filter.value} value={filter.value} count={filter.count}>
            {t(filter.label)}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
