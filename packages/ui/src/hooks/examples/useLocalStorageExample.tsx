import { useState } from 'react';
import { Button } from '../../components/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { readLocalStorageValue, useLocalStorage, useSessionStorage } from '../useLocalStorage';

type Density = 'comfortable' | 'compact';
const densityKey = 'catalog:settings:density';
const isDensity = (value: unknown): value is Density => value === 'comfortable' || value === 'compact';

function SharedDensity() {
  const { t } = useI18n();
  const [density] = useLocalStorage<Density>(densityKey, 'comfortable', { validate: isDensity });
  return (
    <output aria-label={t('hooksExample.storage.shared')}>
      {t('hooksExample.storage.sharedValue', { value: density })}
    </output>
  );
}

export default function StorageExample() {
  const { t } = useI18n();
  const [density, setDensity, removeDensity] = useLocalStorage<Density>(densityKey, 'comfortable', {
    validate: isDensity,
  });
  const [visits, setVisits, removeVisits] = useSessionStorage('catalog:settings:visits', 0);
  const [saved, setSaved] = useState<Density>('comfortable');
  return (
    <div className="flex flex-col gap-4 text-sm text-foreground">
      <output aria-label={t('hooksExample.storage.density')}>
        {t('hooksExample.storage.densityValue', { value: density })}
      </output>
      <SharedDensity />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDensity('compact')}>{t('hooksExample.storage.useCompact')}</Button>
        <Button variant="secondary" onClick={removeDensity}>
          {t('hooksExample.storage.reset')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSaved(readLocalStorageValue<Density>(densityKey, 'comfortable', { validate: isDensity }))}
        >
          {t('hooksExample.storage.read')}
        </Button>
      </div>
      <output aria-label={t('hooksExample.storage.saved')}>
        {t('hooksExample.storage.savedValue', { value: saved })}
      </output>
      <p className="text-muted-foreground">{t('hooksExample.storage.hint')}</p>
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
    </div>
  );
}
