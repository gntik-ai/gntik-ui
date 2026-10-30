import { useI18n } from '../../../i18n/I18nProvider';
import { Radio, RadioGroup } from '../RadioGroup';

/** An explicit accessible name includes the visible label's words. */
export default function RadioGroupWithAccessibleLabel() {
  const { t } = useI18n();
  return (
    <RadioGroup aria-label={t('common.notifications')}>
      <Radio value="email" label={t('labelPrecedence.visible')} />
      <Radio value="updates" label={t('labelPrecedence.visible')} aria-label={t('labelPrecedence.accessible')} />
    </RadioGroup>
  );
}
