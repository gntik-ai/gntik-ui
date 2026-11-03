import { useI18n } from '../../i18n/I18nProvider';
import { useOs } from '../useOs';

export default function OsExample() {
  const { t } = useI18n();
  const os = useOs();
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>{t('hooksExample.os.current', { os })}</p>
      <p className="text-muted-foreground">{t('hooksExample.os.hint')}</p>
    </div>
  );
}
