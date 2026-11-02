import { useState } from 'react';
import { Button } from '../../components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/Popover';
import { useI18n } from '../../i18n/I18nProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { KitProvider } from '../KitProvider';

export default function KitProviderPortals() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const { resolved } = useTheme();
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <KitProvider
        scoped
        theme={{ forcedMode: resolved, storageKey: null }}
        portalContainer={portalContainer}
        toast={false}
        tooltip={false}
        announcer={false}
      >
        <Popover>
          <PopoverTrigger render={<Button variant="secondary" />}>{t('kit.route')}</PopoverTrigger>
          <PopoverContent aria-label={t('kit.scopeTitle')}>{t('kit.scopeHint')}</PopoverContent>
        </Popover>
      </KitProvider>
      <div
        ref={setPortalContainer}
        data-example-portal=""
        className="rounded-lg border border-border bg-background p-3 text-foreground"
      >
        <p className="text-sm text-muted-foreground">{t('kit.scopeTitle')}</p>
      </div>
    </div>
  );
}
