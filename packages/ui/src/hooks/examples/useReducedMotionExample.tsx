import { useI18n } from '../../i18n/I18nProvider';
import { useReducedMotion } from '../useMediaQuery';

export default function ReducedMotionExample() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>
        {t('hooksExample.mediaQuery.motion', {
          state: t(reducedMotion ? 'hooksExample.mediaQuery.reduced' : 'hooksExample.mediaQuery.standard'),
        })}
      </p>
      <p className="text-muted-foreground">{t('hooksExample.reducedMotion.hint')}</p>
    </div>
  );
}
