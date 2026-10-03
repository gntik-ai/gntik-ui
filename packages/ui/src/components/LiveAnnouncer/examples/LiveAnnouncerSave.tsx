import { useState } from 'react';
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
  return (
    <LiveAnnouncer>
      <SaveDraft />
    </LiveAnnouncer>
  );
}
