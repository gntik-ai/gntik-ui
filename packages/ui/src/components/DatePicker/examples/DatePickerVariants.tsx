import { DatePicker } from '../DatePicker';
import { DateRangePicker } from '../DateRangePicker';
import { useI18n } from '../../../i18n/I18nProvider';

export default function DatePickerVariants() {
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
            <>
              <DatePicker {...props} />
              <DateRangePicker {...props} aria-label={`${props['aria-label']} ${t('fieldVariants.range')}`} />
            </>
          </div>
        );
      })}
    </div>
  );
}
