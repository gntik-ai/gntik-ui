import { Combobox, ComboboxInput, ComboboxChipsInput, ComboboxContent, ComboboxItem } from '../Combobox';
import { useI18n } from '../../../i18n/I18nProvider';

export default function ComboboxVariants() {
  const { t } = useI18n();
  return (
    <div className="grid gap-3">
      {(['outline', 'filled', 'ghost'] as const).map((variant) => {
        const props = {
          variant,
          'aria-label': t(`fieldVariants.${variant}`),
        };
        return (
          <div key={variant} className="grid gap-2">
            <Combobox items={['member']}>
              <ComboboxInput {...props} />
              <ComboboxContent>
                {(value: string) => <ComboboxItem value={value}>{t('fieldVariants.option')}</ComboboxItem>}
              </ComboboxContent>
            </Combobox>
            <Combobox items={['member']} multiple>
              <ComboboxChipsInput {...props} aria-label={`${props['aria-label']} ${t('fieldVariants.entries')}`} />
            </Combobox>
          </div>
        );
      })}
    </div>
  );
}
