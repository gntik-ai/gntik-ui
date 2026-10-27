import { TokenInput } from '../TokenInput';
import { useI18n } from '../../../i18n/I18nProvider';

export default function TokenInputVariants() {
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
            <TokenInput {...props} />
            <TokenInput
              {...props}
              readOnly
              aria-label={t('fieldVariants.readOnly')}
              defaultValue={[t('fieldVariants.value')]}
            />
          </div>
        );
      })}
    </div>
  );
}
