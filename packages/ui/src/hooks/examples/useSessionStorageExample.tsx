import { Button } from '../../components/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { useSessionStorage } from '../useLocalStorage';

export default function SessionStorageExample() {
  const { t } = useI18n();
  const [visits, setVisits, removeVisits] = useSessionStorage('catalog:settings:visits', 0);
  return (
    <div className="flex flex-col gap-4 text-sm text-foreground">
      <output aria-label={t('hooksExample.storage.visits')}>
        {t('hooksExample.storage.visitsValue', { count: visits })}
      </output>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setVisits((count) => count + 1)}>
          {t('hooksExample.storage.addVisit')}
        </Button>
        <Button variant="secondary" onClick={removeVisits}>
          {t('hooksExample.storage.resetVisits')}
        </Button>
      </div>
      <p className="text-muted-foreground">{t('hooksExample.sessionStorage.hint')}</p>
    </div>
  );
}
