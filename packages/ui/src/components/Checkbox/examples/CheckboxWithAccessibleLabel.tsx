import { useI18n } from '../../../i18n/I18nProvider';
import { Checkbox } from '../Checkbox';

/** An explicit accessible name includes the visible label's words. */
export default function CheckboxWithAccessibleLabel() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      <Checkbox label={t('labelPrecedence.visible')} />
      <Checkbox label={t('labelPrecedence.visible')} aria-label={t('labelPrecedence.accessible')} />
    </div>
  );
}
