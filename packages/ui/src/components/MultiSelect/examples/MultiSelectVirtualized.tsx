import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { MultiSelect } from '../MultiSelect';

export default function MultiSelectVirtualized() {
  const { t } = useI18n();
  const options = useMemo(
    () =>
      Array.from({ length: 5000 }, (_, i) => ({
        value: String(i + 1),
        label: t('virtualOptions.node', { index: i + 1 }),
        disabled: i === 4999,
      })),
    [t],
  );
  return (
    <div className="w-full max-w-sm">
      <MultiSelect label={t('virtualOptions.multiNodes')} options={options} virtualized itemHeight={32} overscan={4} />
    </div>
  );
}
