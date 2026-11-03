import { breakpointQuery } from '@gntik-ai/tokens/runtime';
import { useI18n } from '../../i18n/I18nProvider';
import { useMediaQuery, useReducedMotion } from '../useMediaQuery';

export default function MediaQueryExample() {
  const { t } = useI18n();
  const wide = useMediaQuery(breakpointQuery('lg'), false);
  const reducedMotion = useReducedMotion();
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>
        {t('hooksExample.mediaQuery.wide', {
          state: t(wide ? 'hooksExample.mediaQuery.enabled' : 'hooksExample.mediaQuery.disabled'),
        })}
      </p>
      <p>
        {t('hooksExample.mediaQuery.motion', {
          state: t(reducedMotion ? 'hooksExample.mediaQuery.reduced' : 'hooksExample.mediaQuery.standard'),
        })}
      </p>
      <p className="text-muted-foreground">{t('hooksExample.mediaQuery.hint')}</p>
    </div>
  );
}
