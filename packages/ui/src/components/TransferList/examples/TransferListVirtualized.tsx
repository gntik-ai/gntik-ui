import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { TransferList } from '../TransferList';

export default function TransferListVirtualized() {
  const { t } = useI18n();
  const items = useMemo(
    () =>
      Array.from({ length: 2000 }, (_, i) => ({
        value: String(i + 1),
        label: t('virtualOptions.node', { index: i + 1 }),
        description: i % 2 ? t('virtualOptions.description') : undefined,
      })),
    [t],
  );
  return (
    <div className="w-full max-w-3xl">
      <TransferList items={items} virtualized />
    </div>
  );
}
