import { type ComponentPropsWithRef } from 'react';
import { Button } from '../../components/Button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../components/Dialog';
import { Link } from '../../components/Link';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/Tooltip';
import { useI18n } from '../../i18n/I18nProvider';
import { KitProvider } from '../KitProvider';

function RouterLink(props: ComponentPropsWithRef<'a'>) {
  return <a {...props} onClick={(event) => event.preventDefault()} />;
}

function Panel() {
  const { t } = useI18n();
  return (
    <section className="rounded-lg border border-border bg-background p-4 text-foreground">
      <h3 className="font-semibold">{t('kit.scopeTitle')}</h3>
      <p className="my-3 text-sm text-muted-foreground">{t('kit.scopeHint')}</p>
      <div className="flex items-center gap-3">
        <Dialog>
          <DialogTrigger render={<Button />}>{t('common.edit')}</DialogTrigger>
          <DialogContent>
            <DialogTitle>{t('kit.scopeTitle')}</DialogTitle>
            <p>{t('kit.scopeHint')}</p>
          </DialogContent>
        </Dialog>
        <Tooltip>
          <TooltipTrigger render={<Button variant="secondary" />}>{t('common.moreActions')}</TooltipTrigger>
          <TooltipContent>{t('kit.scopeHint')}</TooltipContent>
        </Tooltip>
        <Link href="/preview">{t('kit.route')}</Link>
      </div>
    </section>
  );
}

export default function KitProviderScoped() {
  return (
    <KitProvider
      scoped
      toast={false}
      announcer={false}
      theme={{ forcedMode: 'light', storageKey: null }}
      i18n={{ locale: 'es' }}
      density="compact"
      link={RouterLink}
      tooltip={{ delay: 0 }}
      csp={{ disableStyleElements: true }}
    >
      <Panel />
      <KitProvider theme={{ forcedMode: 'dark' }}>
        <p className="bg-background p-4 text-foreground">
          <NestedThemeLabel />
        </p>
      </KitProvider>
    </KitProvider>
  );
}

function NestedThemeLabel() {
  const { t } = useI18n();
  return t('themeScope.nested');
}
