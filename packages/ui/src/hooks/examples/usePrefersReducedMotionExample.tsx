import { useI18n } from '../../i18n/I18nProvider';
import { usePrefersReducedMotion } from '../useMediaQuery';

export default function PrefersReducedMotionExample() {
  const { t } = useI18n();
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>
        {t('hooksExample.mediaQuery.motion', {
          state: t(prefersReducedMotion ? 'hooksExample.mediaQuery.reduced' : 'hooksExample.mediaQuery.standard'),
        })}
      </p>
      <p className="text-muted-foreground">{t('hooksExample.reducedMotion.alias')}</p>
    </div>
  );
}
