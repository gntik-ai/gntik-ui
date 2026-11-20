import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { Button } from '../../Button';
import { LiveAnnouncer, useAnnounce } from '../LiveAnnouncer';

function SaveDraft() {
  const announce = useAnnounce();
  const [saves, setSaves] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        onClick={() => {
          setSaves((n) => n + 1);
          announce('Draft saved.');
        }}
      >
        Save draft
      </Button>
      <span className="font-mono text-[11.5px] text-muted-foreground">Saved {saves} times</span>
    </div>
  );
}

export default function LiveAnnouncerSave() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(true);
  return (
    <LiveAnnouncer enabled={enabled}>
      <Button variant="secondary" aria-pressed={enabled} onClick={() => setEnabled((current) => !current)}>
        {t('common.notifications')}
      </Button>
      <SaveDraft />
    </LiveAnnouncer>
  );
}
