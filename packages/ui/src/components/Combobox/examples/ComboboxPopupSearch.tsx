import { Combobox, ComboboxContent, ComboboxItem, ComboboxPopupInput, ComboboxTrigger } from '../index';
import { useI18n } from '../../../i18n/I18nProvider';

export default function ComboboxPopupSearch() {
  const { t } = useI18n();
  const items = [
    t('searchableSelect.examples.zurich'),
    t('searchableSelect.examples.zagreb'),
    t('searchableSelect.examples.lisbon'),
  ];
  return (
    <div data-example="combobox-popup-search" className="w-full max-w-sm">
      <Combobox items={items}>
        <ComboboxTrigger aria-label={t('searchableSelect.examples.region')}>
          {t('searchableSelect.examples.region')}
        </ComboboxTrigger>
        <ComboboxContent
          aria-label={t('searchableSelect.examples.region')}
          header={<ComboboxPopupInput />}
          footer={
            <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
              {t('searchableSelect.examples.hint')}
            </p>
          }
        >
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
