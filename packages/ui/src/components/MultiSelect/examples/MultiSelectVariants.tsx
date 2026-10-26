import { MultiSelect } from '../MultiSelect';
import { useI18n } from '../../../i18n/I18nProvider';

export default function MultiSelectVariants() {
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
            <MultiSelect {...props} options={[{ value: 'member', label: t('fieldVariants.option') }]} />
            <MultiSelect {...props} readOnly aria-label={t('fieldVariants.readOnly')} options={[]} />
          </div>
        );
      })}
    </div>
  );
}
