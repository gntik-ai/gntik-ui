import { useI18n } from '../../../i18n/I18nProvider';
import { Radio, RadioGroup } from '../RadioGroup';

export default function RadioGroupInline() {
  const { t } = useI18n();
  return (
    <div className="grid max-w-lg gap-6">
      <RadioGroup aria-label={t('radioInline.billingCycle')} orientation="horizontal" defaultValue="monthly">
        <Radio value="monthly" label={t('radioInline.monthly')} />
        <Radio value="annual" label={t('radioInline.annual')} />
      </RadioGroup>
      <RadioGroup aria-label={t('radioInline.retention')} orientation="horizontal" variant="card" defaultValue="30">
        <Radio value="7" label={t('radioInline.days7')} />
        <Radio value="30" label={t('radioInline.days30')} />
        <Radio value="90" label={t('radioInline.days90')} />
      </RadioGroup>
    </div>
  );
}
