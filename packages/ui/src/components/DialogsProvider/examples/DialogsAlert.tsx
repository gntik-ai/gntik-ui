import { Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { DialogsProvider, useDialogs } from '../index';

function SaveSettings() {
  const { alert } = useDialogs();
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="secondary"
        icon={Save}
        onClick={async () => {
          setAcknowledged(false);
          await alert('New sessions use these settings. Open sessions keep the old ones until they end.', {
            title: 'Settings saved',
          });
          setAcknowledged(true);
        }}
      >
        Save settings
      </Button>
      <p aria-live="polite" className="h-4 text-[12px] text-muted-foreground">
        {acknowledged ? 'Acknowledged' : ''}
      </p>
    </div>
  );
}

/** `alert()` resolves once the single OK action is activated; Escape acknowledges it too. */
export default function DialogsAlert() {
  return (
    <DialogsProvider>
      <SaveSettings />
    </DialogsProvider>
  );
}
