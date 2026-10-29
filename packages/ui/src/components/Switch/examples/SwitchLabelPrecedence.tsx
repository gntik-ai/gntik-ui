import { useI18n } from '../../../i18n/I18nProvider';
import { Switch } from '../Switch';

/** An explicit accessible name includes the visible label's words. */
export default function SwitchLabelPrecedence() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      <Switch label={t('labelPrecedence.visible')} />
      <Switch label={t('labelPrecedence.visible')} aria-label={t('labelPrecedence.accessible')} />
    </div>
  );
}
