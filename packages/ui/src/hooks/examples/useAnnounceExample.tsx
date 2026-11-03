import { useState } from 'react';
import { Button } from '../../components/Button';
import { LiveAnnouncer } from '../../components/LiveAnnouncer';
import { useI18n } from '../../i18n/I18nProvider';
import { useAnnounce } from '../index';

function SaveDraft() {
  const { t } = useI18n();
  const announce = useAnnounce();
  const [sent, setSent] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-foreground">
      <Button
        onClick={() => {
          announce(t('hooksExample.announce.message'));
          setSent((count) => count + 1);
        }}
      >
        {t('hooksExample.announce.send')}
      </Button>
      <p>{t('hooksExample.announce.sent', { count: sent })}</p>
      <p className="text-muted-foreground">{t('hooksExample.announce.hint')}</p>
    </div>
  );
}

export default function AnnounceExample() {
  return (
    <LiveAnnouncer>
      <SaveDraft />
    </LiveAnnouncer>
  );
}
