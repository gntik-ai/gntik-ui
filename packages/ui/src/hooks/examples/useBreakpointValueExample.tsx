import { useI18n } from '../../i18n/I18nProvider';
import { useBreakpointValue } from '../useBreakpoint';

export default function BreakpointValueExample() {
  const { t } = useI18n();
  const navigation = useBreakpointValue({ base: 'drawer', lg: 'inline' }, { fallback: 'base' });
  const columns = useBreakpointValue({ md: 2 });
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>{t('hooksExample.breakpoint.navigation', { value: navigation ?? '' })}</p>
      <p>
        {t('hooksExample.breakpoint.columns', {
          value: columns ?? t('hooksExample.breakpoint.columnsNone'),
        })}
      </p>
      <p className="text-muted-foreground">{t('hooksExample.breakpoint.hint')}</p>
    </div>
  );
}
