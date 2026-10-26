import { NumberInput } from '../NumberInput';
import { useI18n } from '../../../i18n/I18nProvider';

export default function NumberInputVariants() {
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
            <NumberInput {...props} defaultValue={3} />
          </div>
        );
      })}
    </div>
  );
}
