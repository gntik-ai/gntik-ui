import { useState } from 'react';
import { Button } from '../../components/Button';
import { useI18n } from '../../i18n/I18nProvider';
import { useDensity } from '../../density/density-context';
import { useTheme } from '../../theme/ThemeProvider';
import { KitProvider, useApp } from '../KitProvider';

function Actions() {
  const { toast, confirm, announce } = useApp();
  const { t } = useI18n();
  const [result, setResult] = useState('');
  const density = useDensity();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => toast.add({ title: t('kit.saved'), tone: 'success' })}>{t('common.save')}</Button>
      <Button variant="secondary" onClick={() => announce(t('kit.moved'))}>
        {t('kit.announce')}
      </Button>
      <Button
        variant="secondary"
        onClick={async () => setResult(t((await confirm(t('kit.confirmMessage'))) ? 'kit.confirmed' : 'kit.cancelled'))}
      >
        {t('dialogs.confirm')}
      </Button>
      <span className="text-sm text-muted-foreground">{density}</span>
      <output className="text-sm text-foreground">{result}</output>
    </div>
  );
}

export default function KitProviderBasic() {
  const { resolved } = useTheme();
  return (
    <KitProvider scoped theme={{ forcedMode: resolved, storageKey: null }}>
      <KitProvider density="compact">
        <Actions />
      </KitProvider>
    </KitProvider>
  );
}
