import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../Combobox';

export default function ComboboxVirtualized() {
  const { t } = useI18n();
  const items = useMemo(() => Array.from({ length: 10000 }, (_, i) => t('virtualOptions.node', { index: i + 1 })), [t]);
  const loadOptions = (query: string, { signal }: { signal: AbortSignal }): Promise<string[]> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(items.slice(0, 5000).filter((item) => item.includes(query))), 300);
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    });
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Combobox items={items} virtualized>
        <ComboboxInput label={t('virtualOptions.nodes')} />
        <ComboboxContent itemHeight={32} overscan={4}>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <Combobox loadOptions={loadOptions} virtualized>
        <ComboboxInput label={t('virtualOptions.remoteNodes')} />
        <ComboboxContent estimatedItemHeight={32} overscan={4}>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <p className="text-[12px] text-muted-foreground">{t('virtualOptions.note')}</p>
    </div>
  );
}
